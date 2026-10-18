// La web es un integrador más de @chaski/sdk: aquí solo conectamos Freighter
// como signer. Otra app podría usar Pollar u otra wallet con el mismo SDK.
import { Chaski, TESTNET, type Order, type Reputation, type Signer } from "@chaski/sdk";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || TESTNET.contractId;
export const NATIVE_TOKEN_ID = process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID || TESTNET.nativeToken;
export const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || TESTNET.rpcUrl;
export const NETWORK_PASSPHRASE = TESTNET.networkPassphrase;

const freighterSigner: Signer = async (txXdr, { networkPassphrase, address }) => {
  const res = await signTransaction(txXdr, { networkPassphrase, address });
  if (res.error) throw new Error(`Firma rechazada: ${res.error}`);
  return res.signedTxXdr;
};

export const chaski = new Chaski({
  contractId: CONTRACT_ID,
  rpcUrl: RPC_URL,
  defaultToken: NATIVE_TOKEN_ID,
  signer: freighterSigner,
});

export type OrderData = Order;
export type ReputationData = Reputation;

// ─── Wallet (Freighter) ─────────────────────────────────────────────────────

export async function isFreighterAvailable(): Promise<boolean> {
  try {
    const res = await isConnected();
    return !!res.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected.isConnected) {
      throw new Error("Freighter no está instalado. Instálalo desde freighter.app");
    }
    const access = await requestAccess();
    if (access.error) {
      throw new Error(access.error);
    }
    const addrObj = await getAddress();
    if (addrObj.error || !addrObj.address) {
      throw new Error(addrObj.error || "No se pudo obtener la dirección.");
    }
    return addrObj.address;
  } catch (err: any) {
    console.error("Error al conectar Freighter:", err);
    throw err;
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const allowed = await isAllowed();
    if (!allowed.isAllowed) return null;
    const addr = await getAddress();
    return addr.address || null;
  } catch {
    return null;
  }
}

// ─── Contrato (vía SDK) ─────────────────────────────────────────────────────

const asTx = <T>(res: { txHash: string; value: T }) => ({ hash: res.txHash, returnValue: res.value });

export const getOrder = (orderId: number) => chaski.getOrder(orderId);
export const getReputation = (address: string) => chaski.getReputation(address);
export const explorerTxUrl = (hash: string) => chaski.txUrl(hash);

export async function createOrder(p: {
  sellerAddress: string;
  amountXlm: number;
  shipDeadlineSecs?: number;
  confirmWindowSecs?: number;
}) {
  return asTx(
    await chaski.createOrder({
      seller: p.sellerAddress,
      amount: p.amountXlm,
      shipDeadlineSecs: p.shipDeadlineSecs,
      confirmWindowSecs: p.confirmWindowSecs,
    })
  );
}

export async function fundOrder(p: { orderId: number; buyerAddress: string }) {
  return asTx(await chaski.fund(p.orderId, p.buyerAddress));
}

export async function markShipped(p: { orderId: number; sellerAddress: string; evidenceHashHex: string }) {
  return asTx(await chaski.markShipped(p.orderId, p.sellerAddress, p.evidenceHashHex));
}

export async function confirmReceived(p: { orderId: number; buyerAddress: string }) {
  return asTx(await chaski.confirmReceived(p.orderId, p.buyerAddress));
}

export async function openDispute(p: { orderId: number; callerAddress: string }) {
  return asTx(await chaski.openDispute(p.orderId, p.callerAddress));
}

export async function resolveDispute(p: { orderId: number; arbiterAddress: string; releaseToSeller: boolean }) {
  return asTx(await chaski.resolveDispute(p.orderId, p.arbiterAddress, p.releaseToSeller));
}

export async function claimAfterTimeout(p: { orderId: number; sellerAddress: string }) {
  return asTx(await chaski.claimAfterTimeout(p.orderId, p.sellerAddress));
}

export async function refundIfNotShipped(p: { orderId: number; buyerAddress: string }) {
  return asTx(await chaski.refundIfNotShipped(p.orderId, p.buyerAddress));
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const hashBuf = await crypto.subtle.digest("SHA-256", data as BufferSource);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}
