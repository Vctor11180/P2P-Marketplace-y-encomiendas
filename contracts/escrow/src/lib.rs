#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    OrderNotFound = 3,
    InvalidStatus = 4,
    InvalidAmount = 5,
    SameBuyerSeller = 6,
    DeadlineNotPassed = 7,
    Unauthorized = 8,
}

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Status {
    Created = 0,
    Funded = 1,
    Shipped = 2,
    Completed = 3,
    Disputed = 4,
    Refunded = 5,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Order {
    pub id: u64,
    pub seller: Address,
    pub buyer: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub status: Status,
    pub evidence_hash: Option<BytesN<32>>,
    pub created_at: u64,
    pub funded_at: u64,
    pub shipped_at: u64,
    pub ship_deadline_secs: u64,
    pub confirm_window_secs: u64,
}

#[contracttype]
#[derive(Clone, Debug, Default)]
pub struct Reputation {
    pub completed: u32,
    pub disputes_lost: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Arbiter,
    OrderCount,
    Order(u64),
    Reputation(Address),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init(env: Env, admin: Address, arbiter: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Arbiter, &arbiter);
        env.storage().instance().set(&DataKey::OrderCount, &0u64);
    }

    pub fn create_order(
        env: Env,
        seller: Address,
        token: Address,
        amount: i128,
        ship_deadline_secs: u64,
        confirm_window_secs: u64,
    ) -> u64 {
        seller.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0);
        count += 1;

        let now = env.ledger().timestamp();
        let order = Order {
            id: count,
            seller: seller.clone(),
            buyer: None,
            token,
            amount,
            status: Status::Created,
            evidence_hash: None,
            created_at: now,
            funded_at: 0,
            shipped_at: 0,
            ship_deadline_secs,
            confirm_window_secs,
        };

        env.storage().instance().set(&DataKey::Order(count), &order);
        env.storage().instance().set(&DataKey::OrderCount, &count);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("created")),
            (count, seller, amount),
        );

        count
    }

    pub fn fund(env: Env, order_id: u64, buyer: Address) {
        buyer.require_auth();

        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        if order.status != Status::Created {
            panic!("order is not in Created status");
        }

        if buyer == order.seller {
            panic!("buyer cannot be seller");
        }

        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(&buyer, &env.current_contract_address(), &order.amount);

        order.buyer = Some(buyer.clone());
        order.funded_at = env.ledger().timestamp();
        order.status = Status::Funded;

        env.storage().instance().set(&DataKey::Order(order_id), &order);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("funded")),
            (order_id, buyer, order.amount),
        );
    }

    pub fn mark_shipped(env: Env, order_id: u64, evidence_hash: BytesN<32>) {
        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        order.seller.require_auth();

        if order.status != Status::Funded {
            panic!("order is not Funded");
        }

        order.evidence_hash = Some(evidence_hash.clone());
        order.shipped_at = env.ledger().timestamp();
        order.status = Status::Shipped;

        env.storage().instance().set(&DataKey::Order(order_id), &order);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("shipped")),
            (order_id, evidence_hash),
        );
    }

    pub fn confirm_received(env: Env, order_id: u64) {
        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        let buyer = order.buyer.clone().expect("buyer not set");
        buyer.require_auth();

        if order.status != Status::Shipped {
            panic!("order is not Shipped");
        }

        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(&env.current_contract_address(), &order.seller, &order.amount);

        order.status = Status::Completed;
        env.storage().instance().set(&DataKey::Order(order_id), &order);

        Self::increment_reputation_completed(&env, &order.seller);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("completed")),
            (order_id, order.seller, order.amount),
        );
    }

    pub fn claim_after_timeout(env: Env, order_id: u64) {
        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        order.seller.require_auth();

        if order.status != Status::Shipped {
            panic!("order is not Shipped");
        }

        let now = env.ledger().timestamp();
        if now < order.shipped_at + order.confirm_window_secs {
            panic!("confirmation window has not passed yet");
        }

        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(&env.current_contract_address(), &order.seller, &order.amount);

        order.status = Status::Completed;
        env.storage().instance().set(&DataKey::Order(order_id), &order);

        Self::increment_reputation_completed(&env, &order.seller);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("timeout_c")),
            (order_id, order.seller, order.amount),
        );
    }

    pub fn refund_if_not_shipped(env: Env, order_id: u64) {
        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        let buyer = order.buyer.clone().expect("buyer not set");
        buyer.require_auth();

        if order.status != Status::Funded {
            panic!("order is not Funded");
        }

        let now = env.ledger().timestamp();
        if now < order.funded_at + order.ship_deadline_secs {
            panic!("ship deadline has not passed yet");
        }

        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(&env.current_contract_address(), &buyer, &order.amount);

        order.status = Status::Refunded;
        env.storage().instance().set(&DataKey::Order(order_id), &order);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("refunded")),
            (order_id, buyer, order.amount),
        );
    }

    pub fn open_dispute(env: Env, order_id: u64, caller: Address) {
        caller.require_auth();

        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        let buyer = order.buyer.clone().expect("buyer not set");
        if caller != order.seller && caller != buyer {
            panic!("unauthorized dispute caller");
        }

        if order.status != Status::Shipped {
            panic!("order must be in Shipped status to dispute");
        }

        order.status = Status::Disputed;
        env.storage().instance().set(&DataKey::Order(order_id), &order);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("disputed")),
            (order_id, caller),
        );
    }

    pub fn resolve_dispute(env: Env, order_id: u64, release_to_seller: bool) {
        let arbiter: Address = env
            .storage()
            .instance()
            .get(&DataKey::Arbiter)
            .expect("arbiter not configured");
        arbiter.require_auth();

        let mut order: Order = env
            .storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found");

        if order.status != Status::Disputed {
            panic!("order is not Disputed");
        }

        let token_client = token::Client::new(&env, &order.token);
        let buyer = order.buyer.clone().expect("buyer not set");

        if release_to_seller {
            token_client.transfer(&env.current_contract_address(), &order.seller, &order.amount);
            order.status = Status::Completed;
            Self::increment_reputation_completed(&env, &order.seller);
            Self::increment_reputation_lost(&env, &buyer);
        } else {
            token_client.transfer(&env.current_contract_address(), &buyer, &order.amount);
            order.status = Status::Refunded;
            Self::increment_reputation_lost(&env, &order.seller);
        }

        env.storage().instance().set(&DataKey::Order(order_id), &order);

        env.events().publish(
            (symbol_short!("order"), symbol_short!("resolved")),
            (order_id, release_to_seller),
        );
    }

    pub fn get_order(env: Env, order_id: u64) -> Order {
        env.storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .expect("order not found")
    }

    pub fn get_reputation(env: Env, addr: Address) -> Reputation {
        env.storage()
            .instance()
            .get(&DataKey::Reputation(addr))
            .unwrap_or_default()
    }

    fn increment_reputation_completed(env: &Env, addr: &Address) {
        let mut rep: Reputation = env
            .storage()
            .instance()
            .get(&DataKey::Reputation(addr.clone()))
            .unwrap_or_default();
        rep.completed += 1;
        env.storage().instance().set(&DataKey::Reputation(addr.clone()), &rep);
    }

    fn increment_reputation_lost(env: &Env, addr: &Address) {
        let mut rep: Reputation = env
            .storage()
            .instance()
            .get(&DataKey::Reputation(addr.clone()))
            .unwrap_or_default();
        rep.disputes_lost += 1;
        env.storage().instance().set(&DataKey::Reputation(addr.clone()), &rep);
    }
}

#[cfg(test)]
mod test;
