#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, BytesN, Env,
};

fn setup_test<'a>(
    env: &Env,
) -> (
    EscrowContractClient<'a>,
    Address,
    Address,
    Address,
    Address,
    Address,
    token::Client<'a>,
    token::StellarAssetClient<'a>,
) {
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(env, &contract_id);

    let admin = Address::generate(env);
    let arbiter = Address::generate(env);
    let seller = Address::generate(env);
    let buyer = Address::generate(env);
    let token_admin = Address::generate(env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_client = token::Client::new(env, &token_address);
    let token_asset_client = token::StellarAssetClient::new(env, &token_address);

    client.init(&admin, &arbiter);

    // Mint tokens to buyer
    token_asset_client.mint(&buyer, &1000);

    (
        client,
        admin,
        arbiter,
        seller,
        buyer,
        token_address,
        token_client,
        token_asset_client,
    )
}

#[test]
fn test_happy_path() {
    let env = Env::default();
    let (client, _, _, seller, buyer, token_addr, token_client, _) = setup_test(&env);

    let amount = 500i128;
    let ship_deadline = 3600u64;
    let confirm_window = 7200u64;

    let order_id = client.create_order(&seller, &token_addr, &amount, &ship_deadline, &confirm_window);
    assert_eq!(order_id, 1);

    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Created);
    assert_eq!(order.amount, amount);

    // Buyer funds order
    client.fund(&order_id, &buyer);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Funded);
    assert_eq!(token_client.balance(&buyer), 500);

    // Seller marks shipped with evidence hash
    let evidence = BytesN::from_array(&env, &[7u8; 32]);
    client.mark_shipped(&order_id, &evidence);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Shipped);
    assert_eq!(order.evidence_hash, Some(evidence));

    // Buyer confirms received -> Seller receives funds
    client.confirm_received(&order_id);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Completed);
    assert_eq!(token_client.balance(&seller), 500);

    // Check seller reputation
    let rep = client.get_reputation(&seller);
    assert_eq!(rep.completed, 1);
    assert_eq!(rep.disputes_lost, 0);
}

#[test]
fn test_claim_after_timeout() {
    let env = Env::default();
    let (client, _, _, seller, buyer, token_addr, token_client, _) = setup_test(&env);

    let order_id = client.create_order(&seller, &token_addr, &500, &3600, &7200);
    client.fund(&order_id, &buyer);

    let evidence = BytesN::from_array(&env, &[1u8; 32]);
    client.mark_shipped(&order_id, &evidence);

    // Advance time past confirm window
    let current_time = env.ledger().timestamp();
    env.ledger().set_timestamp(current_time + 7201);

    client.claim_after_timeout(&order_id);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Completed);
    assert_eq!(token_client.balance(&seller), 500);
}

#[test]
fn test_refund_if_not_shipped() {
    let env = Env::default();
    let (client, _, _, seller, buyer, token_addr, token_client, _) = setup_test(&env);

    let order_id = client.create_order(&seller, &token_addr, &500, &3600, &7200);
    client.fund(&order_id, &buyer);

    // Advance time past shipping deadline without seller shipping
    let current_time = env.ledger().timestamp();
    env.ledger().set_timestamp(current_time + 3601);

    client.refund_if_not_shipped(&order_id);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Refunded);
    assert_eq!(token_client.balance(&buyer), 1000);
}

#[test]
fn test_dispute_resolved_to_buyer() {
    let env = Env::default();
    let (client, _, _, seller, buyer, token_addr, token_client, _) = setup_test(&env);

    let order_id = client.create_order(&seller, &token_addr, &500, &3600, &7200);
    client.fund(&order_id, &buyer);

    let evidence = BytesN::from_array(&env, &[3u8; 32]);
    client.mark_shipped(&order_id, &evidence);

    // Buyer opens dispute
    client.open_dispute(&order_id, &buyer);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Disputed);

    // Arbiter resolves dispute in favor of buyer (release_to_seller = false)
    client.resolve_dispute(&order_id, &false);
    let order = client.get_order(&order_id);
    assert_eq!(order.status, Status::Refunded);
    assert_eq!(token_client.balance(&buyer), 1000);

    // Seller gets a lost dispute penalty
    let seller_rep = client.get_reputation(&seller);
    assert_eq!(seller_rep.disputes_lost, 1);
}

#[test]
#[should_panic(expected = "buyer cannot be seller")]
fn test_same_buyer_and_seller_fails() {
    let env = Env::default();
    let (client, _, _, seller, _, token_addr, _, token_asset_client) = setup_test(&env);

    token_asset_client.mint(&seller, &1000);
    let order_id = client.create_order(&seller, &token_addr, &500, &3600, &7200);

    // Seller tries to fund their own order
    client.fund(&order_id, &seller);
}
