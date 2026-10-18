/**
 * @chaski/sdk — Pagos condicionados (escrow) sobre Stellar Soroban.
 *
 * Agnóstico de wallet: recibe una función `signer` que firma XDR, así que
 * funciona con Freighter, wallets embebidas (ej. Pollar) o un backend con Keypair.
 */
import {
  rpc,
  Address,
  Account,
  Operation,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

// ─── Configuración ──────────────────────────────────────────────────────────

export const TESTNET = {
  contractId: "CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X",
  nativeToken: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET,
  explorer: "https://stellar.expert/explorer/testnet",
} as const;

/** Firma un XDR de transacción y devuelve el XDR firmado. */
export type Signer = (
  txXdr: string,
  opts: { networkPassphrase: string; address: string }
) => Promise<string>;

export interface ChaskiConfig {
  /** Función de firma (Freighter, Pollar, Keypair...). Solo hace falta para escribir. */
  signer?: Signer;
  contractId?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
  /** Token por defecto (SAC). XLM nativo de testnet si no se indica. */
  defaultToken?: string;
  explorerUrl?: string;
}

// ─── Tipos del contrato ─────────────────────────────────────────────────────

export type OrderStatus = "Created" | "Funded" | "Shipped" | "Completed" | "Disputed" | "Refunded";

export interface Order {
  id: number;
  seller: string;
  buyer: string | null;
  token: string;
  /** Monto en unidades del token (7 decimales, igual que XLM y USDC en Stellar). */
  amount: string;
  rawAmount: bigint;
  status: OrderStatus;
  evidenceHash: string | null;
  createdAt: number;
  fundedAt: number;
  shippedAt: number;
  shipDeadlineSecs: number;
  confirmWindowSecs: number;
}

export interface Reputation {
  completed: number;
  disputesLost: number;
}

export interface TxResult<T = undefined> {
  txHash: string;
  explorerUrl: string;
  value: T;
}

export class ChaskiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ChaskiError";
  }
}

const STATUSES: OrderStatus[] = ["Created", "Funded", "Shipped", "Completed", "Disputed", "Refunded"];
const DECIMALS = BigInt(10_000_000);
// Cuenta usada solo para simular lecturas (no firma nada)
const READ_ONLY_SOURCE = "GDOFC22AYEG6VYDOD5JYT2HSZV5RTGSFXE3EYF4YHQPVUDRCCFASC27G";

export function toUnits(amount: number | string): bigint {
  const [int, frac = ""] = String(amount).split(".");
  return BigInt(int || "0") * DECIMALS + BigInt((frac + "0000000").slice(0, 7));
}

export function fromUnits(raw: bigint): string {
  const int = raw / DECIMALS;
  const frac = (raw % DECIMALS).toString().padStart(7, "0").replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int.toString();
}

function parseStatus(v: unknown): OrderStatus {
  if (typeof v === "number") return STATUSES[v] ?? "Created";
  if (typeof v === "string") return v as OrderStatus;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0] as OrderStatus;
  if (v && typeof v === "object") return (Object.keys(v)[0] as OrderStatus) ?? "Created";
  return "Created";
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
    throw new ChaskiError("El hash de evidencia debe ser SHA-256 en hex (64 caracteres).");
  }
  return Uint8Array.from(clean.match(/../g)!.map((b) => parseInt(b, 16)));
}

const u64 = (n: number) => nativeToScVal(BigInt(n), { type: "u64" });
const addr = (a: string) => new Address(a).toScVal();

// ─── Cliente ────────────────────────────────────────────────────────────────

export class Chaski {
  readonly contractId: string;
  readonly networkPassphrase: string;
  readonly defaultToken: string;
  readonly server: rpc.Server;
  private readonly explorerUrl: string;
  private signer?: Signer;

  constructor(config: ChaskiConfig = {}) {
    this.contractId = config.contractId ?? TESTNET.contractId;
    this.networkPassphrase = config.networkPassphrase ?? TESTNET.networkPassphrase;
    this.defaultToken = config.defaultToken ?? TESTNET.nativeToken;
    this.explorerUrl = config.explorerUrl ?? TESTNET.explorer;
    this.server = new rpc.Server(config.rpcUrl ?? TESTNET.rpcUrl);
    this.signer = config.signer;
  }

  /** Cambia la wallet que firma (ej. cuando el usuario conecta otra cuenta). */
  setSigner(signer: Signer) {
    this.signer = signer;
  }

  txUrl(hash: string) {
    return `${this.explorerUrl}/tx/${hash}`;
  }

  /** Link de checkout que el vendedor comparte por WhatsApp / Marketplace. */
  payUrl(orderId: number, baseUrl: string) {
    return `${baseUrl.replace(/\/$/, "")}/orden/${orderId}`;
  }

  // ── Escritura ──

  async createOrder(p: {
    seller: string;
    amount: number | string;
    token?: string;
    shipDeadlineSecs?: number;
    confirmWindowSecs?: number;
  }): Promise<TxResult<number>> {
    const amount = toUnits(p.amount);
    if (amount <= BigInt(0)) throw new ChaskiError("El monto debe ser mayor a 0.");
    const res = await this.invoke(p.seller, "create_order", [
      addr(p.seller),
      addr(p.token ?? this.defaultToken),
      nativeToScVal(amount, { type: "i128" }),
      u64(p.shipDeadlineSecs ?? 86_400),
      u64(p.confirmWindowSecs ?? 259_200),
    ]);
    const orderId = Number(res.value);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new ChaskiError(`Orden creada (tx ${res.txHash}) pero no se pudo leer su ID.`);
    }
    return { ...res, value: orderId };
  }

  fund(orderId: number, buyer: string) {
    return this.invokeVoid(buyer, "fund", [u64(orderId), addr(buyer)]);
  }

  markShipped(orderId: number, seller: string, evidenceHashHex: string) {
    return this.invokeVoid(seller, "mark_shipped", [
      u64(orderId),
      xdr.ScVal.scvBytes(Buffer.from(fromHex(evidenceHashHex))),
    ]);
  }

  confirmReceived(orderId: number, buyer: string) {
    return this.invokeVoid(buyer, "confirm_received", [u64(orderId)]);
  }

  claimAfterTimeout(orderId: number, seller: string) {
    return this.invokeVoid(seller, "claim_after_timeout", [u64(orderId)]);
  }

  refundIfNotShipped(orderId: number, buyer: string) {
    return this.invokeVoid(buyer, "refund_if_not_shipped", [u64(orderId)]);
  }

  openDispute(orderId: number, caller: string) {
    return this.invokeVoid(caller, "open_dispute", [u64(orderId), addr(caller)]);
  }

  resolveDispute(orderId: number, arbiter: string, releaseToSeller: boolean) {
    return this.invokeVoid(arbiter, "resolve_dispute", [
      u64(orderId),
      nativeToScVal(releaseToSeller, { type: "bool" }),
    ]);
  }

  // ── Lectura (sin firma) ──

  async getOrder(orderId: number): Promise<Order> {
    const n = await this.read("get_order", [u64(orderId)]).catch(() => {
      throw new ChaskiError(`Orden #${orderId} no encontrada.`);
    });
    const raw = BigInt(n.amount);
    return {
      id: Number(n.id),
      seller: n.seller,
      buyer: n.buyer ?? null,
      token: n.token,
      amount: fromUnits(raw),
      rawAmount: raw,
      status: parseStatus(n.status),
      evidenceHash: n.evidence_hash ? toHex(new Uint8Array(n.evidence_hash)) : null,
      createdAt: Number(n.created_at),
      fundedAt: Number(n.funded_at),
      shippedAt: Number(n.shipped_at),
      shipDeadlineSecs: Number(n.ship_deadline_secs),
      confirmWindowSecs: Number(n.confirm_window_secs),
    };
  }

  async getReputation(address: string): Promise<Reputation> {
    try {
      const n = await this.read("get_reputation", [addr(address)]);
      return { completed: Number(n.completed ?? 0), disputesLost: Number(n.disputes_lost ?? 0) };
    } catch {
      return { completed: 0, disputesLost: 0 };
    }
  }

  // ── Internos ──

  private async read(fn: string, args: xdr.ScVal[]): Promise<any> {
    const tx = new TransactionBuilder(new Account(READ_ONLY_SOURCE, "0"), {
      fee: "100",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(Operation.invokeContractFunction({ contract: this.contractId, function: fn, args }))
      .setTimeout(30)
      .build();
    const sim = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result) {
      throw new ChaskiError(`Lectura ${fn} falló`);
    }
    return scValToNative(sim.result.retval);
  }

  private async invokeVoid(source: string, fn: string, args: xdr.ScVal[]): Promise<TxResult> {
    const res = await this.invoke(source, fn, args);
    return { ...res, value: undefined };
  }

  private async invoke(source: string, fn: string, args: xdr.ScVal[]): Promise<TxResult<unknown>> {
    if (!this.signer) throw new ChaskiError("Configurá un signer para enviar transacciones.");

    const account = await this.server.getAccount(source);
    let tx = new TransactionBuilder(account, { fee: "10000", networkPassphrase: this.networkPassphrase })
      .addOperation(Operation.invokeContractFunction({ contract: this.contractId, function: fn, args }))
      .setTimeout(60)
      .build();

    const sim = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) throw new ChaskiError(friendlyError(sim.error), sim.error);
    tx = rpc.assembleTransaction(tx, sim).build();

    const signedXdr = await this.signer(tx.toXDR(), {
      networkPassphrase: this.networkPassphrase,
      address: source,
    });
    const signed = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);

    const sent = await this.server.sendTransaction(signed);
    if (sent.status === "ERROR") {
      throw new ChaskiError("La red rechazó la transacción.", sent.errorResult);
    }

    // La tx ya fue enviada: un corte de red al consultar su estado no significa que falló,
    // así que reintentamos en vez de propagar el "Failed to fetch".
    let status: rpc.Api.GetTransactionResponse | undefined;
    for (let i = 0; i < 30; i++) {
      try {
        status = await this.server.getTransaction(sent.hash);
        if (status.status !== "NOT_FOUND") break;
      } catch {
        // error transitorio del RPC; se reintenta
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (status?.status === "FAILED") throw new ChaskiError(`La transacción falló on-chain (${sent.hash}).`);
    if (status?.status !== "SUCCESS") {
      throw new ChaskiError(`No se pudo confirmar a tiempo; revisá ${this.txUrl(sent.hash)} antes de reintentar.`);
    }

    return {
      txHash: sent.hash,
      explorerUrl: this.txUrl(sent.hash),
      value: status.returnValue ? scValToNative(status.returnValue) : undefined,
    };
  }
}

function friendlyError(raw: string): string {
  if (raw.includes("UnreachableCodeReached")) {
    return "El contrato rechazó la operación: el estado de la orden cambió o el plazo todavía no venció.";
  }
  if (raw.includes("Auth")) return "Esta wallet no tiene permiso para esta acción en la orden.";
  if (raw.includes("balance") || raw.includes("insufficient")) {
    return "Saldo insuficiente en la wallet.";
  }
  return `Error en simulación: ${raw}`;
}
