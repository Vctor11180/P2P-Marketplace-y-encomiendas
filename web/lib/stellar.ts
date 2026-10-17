import {
  rpc,
  Address,
  Account,
  Operation,
  nativeToScVal,
  scValToNative,
  xdr,
  TransactionBuilder,
  Networks,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ||
  "CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X";

export const NATIVE_TOKEN_ID =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new rpc.Server(RPC_URL);

// Dummy read-only account for simulation queries
const DUMMY_PUBKEY = "GDOFC22AYEG6VYDOD5JYT2HSZV5RTGSFXE3EYF4YHQPVUDRCCFASC27G";

export interface OrderData {
  id: number;
  seller: string;
  buyer: string | null;
  token: string;
  amount: string; // in XLM
  rawAmount: bigint;
  status: "Created" | "Funded" | "Shipped" | "Completed" | "Disputed" | "Refunded";
  evidenceHash: string | null;
  createdAt: number;
  fundedAt: number;
  shippedAt: number;
  shipDeadlineSecs: number;
  confirmWindowSecs: number;
}

export interface ReputationData {
  completed: number;
  disputesLost: number;
}

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

export function parseStatus(statusVal: any): OrderData["status"] {
  if (typeof statusVal === "string") {
    return statusVal as OrderData["status"];
  }
  if (typeof statusVal === "number") {
    const map = ["Created", "Funded", "Shipped", "Completed", "Disputed", "Refunded"];
    return (map[statusVal] || "Created") as OrderData["status"];
  }
  if (statusVal && typeof statusVal === "object") {
    const keys = Object.keys(statusVal);
    if (keys.length > 0) return keys[0] as OrderData["status"];
  }
  return "Created";
}

export async function getOrder(orderId: number): Promise<OrderData> {
  const dummyAccount = new Account(DUMMY_PUBKEY, "0");
  const tx = new TransactionBuilder(dummyAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: "get_order",
        args: [nativeToScVal(BigInt(orderId), { type: "u64" })],
      })
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim) || !sim.result) {
    throw new Error(`Orden #${orderId} no encontrada`);
  }

  const native = scValToNative(sim.result.retval);

  return {
    id: Number(native.id),
    seller: native.seller,
    buyer: native.buyer || null,
    token: native.token,
    amount: (Number(native.amount) / 10_000_000).toString(),
    rawAmount: BigInt(native.amount),
    status: parseStatus(native.status),
    evidenceHash: native.evidence_hash
      ? Buffer.from(native.evidence_hash).toString("hex")
      : null,
    createdAt: Number(native.created_at),
    fundedAt: Number(native.funded_at),
    shippedAt: Number(native.shipped_at),
    shipDeadlineSecs: Number(native.ship_deadline_secs),
    confirmWindowSecs: Number(native.confirm_window_secs),
  };
}

export async function getReputation(address: string): Promise<ReputationData> {
  try {
    const dummyAccount = new Account(DUMMY_PUBKEY, "0");
    const tx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "get_reputation",
          args: [new Address(address).toScVal()],
        })
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result) {
      return { completed: 0, disputesLost: 0 };
    }
    const native = scValToNative(sim.result.retval);
    return {
      completed: Number(native.completed || 0),
      disputesLost: Number(native.disputes_lost || 0),
    };
  } catch {
    return { completed: 0, disputesLost: 0 };
  }
}

export async function invokeContractWithFreighter({
  functionName,
  args,
  userAddress,
}: {
  functionName: string;
  args: xdr.ScVal[];
  userAddress: string;
}) {
  const account = await server.getAccount(userAddress);

  let tx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: functionName,
        args,
      })
    )
    .setTimeout(60)
    .build();

  // 1. Simular transacción
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    console.error("Simulación fallida:", sim.error);
    if (sim.error.includes("UnreachableCodeReached")) {
      throw new Error(
        "El contrato rechazó la operación: el estado de la orden cambió o el plazo todavía no venció. Actualizá la página."
      );
    }
    if (sim.error.includes("Auth")) {
      throw new Error("Esta wallet no tiene permiso para esta acción en la orden.");
    }
    if (sim.error.includes("balance") || sim.error.includes("insufficient")) {
      throw new Error("Saldo insuficiente en la wallet (fondeala con Friendbot en testnet).");
    }
    throw new Error(`Error en simulación: ${sim.error}`);
  }

  // 2. Ensamblar con footprints y auth entries
  tx = rpc.assembleTransaction(tx, sim).build();

  // 3. Firmar con Freighter
  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signResult.error) {
    throw new Error(`Firma rechazada: ${signResult.error}`);
  }

  // 4. Enviar a Stellar
  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );
  const sendRes = await server.sendTransaction(signedTx);
  if (sendRes.status === "ERROR") {
    throw new Error(`Error enviando transacción: ${JSON.stringify(sendRes.errorResult)}`);
  }

  // 5. Esperar confirmación
  let statusRes = await server.getTransaction(sendRes.hash);
  let attempts = 0;
  while (statusRes.status === "NOT_FOUND" && attempts < 30) {
    await new Promise((r) => setTimeout(r, 1000));
    statusRes = await server.getTransaction(sendRes.hash);
    attempts++;
  }

  if (statusRes.status === "FAILED") {
    throw new Error(`La transacción falló on-chain (${sendRes.hash})`);
  }
  if (statusRes.status !== "SUCCESS") {
    throw new Error(`Tiempo de espera agotado confirmando ${sendRes.hash}`);
  }

  const returnValue = statusRes.returnValue
    ? scValToNative(statusRes.returnValue)
    : undefined;

  return { hash: sendRes.hash, result: statusRes, returnValue };
}

export function explorerTxUrl(hash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export async function createOrder({
  sellerAddress,
  amountXlm,
  shipDeadlineSecs = 86400,
  confirmWindowSecs = 259200,
}: {
  sellerAddress: string;
  amountXlm: number;
  shipDeadlineSecs?: number;
  confirmWindowSecs?: number;
}) {
  const stroops = BigInt(Math.round(amountXlm * 10_000_000));
  return invokeContractWithFreighter({
    functionName: "create_order",
    userAddress: sellerAddress,
    args: [
      new Address(sellerAddress).toScVal(),
      new Address(NATIVE_TOKEN_ID).toScVal(),
      nativeToScVal(stroops, { type: "i128" }),
      nativeToScVal(BigInt(shipDeadlineSecs), { type: "u64" }),
      nativeToScVal(BigInt(confirmWindowSecs), { type: "u64" }),
    ],
  });
}

export async function fundOrder({
  orderId,
  buyerAddress,
}: {
  orderId: number;
  buyerAddress: string;
}) {
  return invokeContractWithFreighter({
    functionName: "fund",
    userAddress: buyerAddress,
    args: [
      nativeToScVal(BigInt(orderId), { type: "u64" }),
      new Address(buyerAddress).toScVal(),
    ],
  });
}

export async function markShipped({
  orderId,
  sellerAddress,
  evidenceHashHex,
}: {
  orderId: number;
  sellerAddress: string;
  evidenceHashHex: string;
}) {
  const cleanHex = evidenceHashHex.replace(/^0x/, "").padStart(64, "0").slice(0, 64);
  const buf = Buffer.from(cleanHex, "hex");

  return invokeContractWithFreighter({
    functionName: "mark_shipped",
    userAddress: sellerAddress,
    args: [
      nativeToScVal(BigInt(orderId), { type: "u64" }),
      xdr.ScVal.scvBytes(buf),
    ],
  });
}

export async function confirmReceived({
  orderId,
  buyerAddress,
}: {
  orderId: number;
  buyerAddress: string;
}) {
  return invokeContractWithFreighter({
    functionName: "confirm_received",
    userAddress: buyerAddress,
    args: [nativeToScVal(BigInt(orderId), { type: "u64" })],
  });
}

export async function openDispute({
  orderId,
  callerAddress,
}: {
  orderId: number;
  callerAddress: string;
}) {
  return invokeContractWithFreighter({
    functionName: "open_dispute",
    userAddress: callerAddress,
    args: [
      nativeToScVal(BigInt(orderId), { type: "u64" }),
      new Address(callerAddress).toScVal(),
    ],
  });
}

export async function resolveDispute({
  orderId,
  arbiterAddress,
  releaseToSeller,
}: {
  orderId: number;
  arbiterAddress: string;
  releaseToSeller: boolean;
}) {
  return invokeContractWithFreighter({
    functionName: "resolve_dispute",
    userAddress: arbiterAddress,
    args: [
      nativeToScVal(BigInt(orderId), { type: "u64" }),
      nativeToScVal(releaseToSeller, { type: "bool" }),
    ],
  });
}

export async function claimAfterTimeout({
  orderId,
  sellerAddress,
}: {
  orderId: number;
  sellerAddress: string;
}) {
  return invokeContractWithFreighter({
    functionName: "claim_after_timeout",
    userAddress: sellerAddress,
    args: [nativeToScVal(BigInt(orderId), { type: "u64" })],
  });
}

export async function refundIfNotShipped({
  orderId,
  buyerAddress,
}: {
  orderId: number;
  buyerAddress: string;
}) {
  return invokeContractWithFreighter({
    functionName: "refund_if_not_shipped",
    userAddress: buyerAddress,
    args: [nativeToScVal(BigInt(orderId), { type: "u64" })],
  });
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const hashBuf = await crypto.subtle.digest("SHA-256", data as BufferSource);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}
