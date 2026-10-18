/**
 * Ejemplo de integración de @chaski/sdk desde un backend (sin Freighter).
 * Cualquier app (marketplace, logística, fintech) puede custodiar pagos así.
 *
 * Uso (testnet):
 *   CHASKI_SELLER_SECRET=S... CHASKI_BUYER_SECRET=S... npx tsx scripts/sdk-demo.ts
 */
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { Chaski, type Signer } from "@chaski/sdk";

const seller = Keypair.fromSecret(process.env.CHASKI_SELLER_SECRET!);
const buyer = Keypair.fromSecret(process.env.CHASKI_BUYER_SECRET!);
const keys = new Map([seller, buyer].map((k) => [k.publicKey(), k]));

// Signer de backend: firma con la Keypair de la cuenta que corresponda
const keypairSigner: Signer = async (xdr, { networkPassphrase, address }) => {
  const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
  tx.sign(keys.get(address)!);
  return tx.toXDR();
};

async function main() {
  const chaski = new Chaski({ signer: keypairSigner });

  const { value: orderId, explorerUrl: createdTx } = await chaski.createOrder({
    seller: seller.publicKey(),
    amount: 1.5,
  });
  console.log(`1. Orden #${orderId} creada        ${createdTx}`);
  console.log(`   Link de pago: ${chaski.payUrl(orderId, "https://chaski.example")}`);

  console.log(`2. Pago en escrow               ${(await chaski.fund(orderId, buyer.publicKey())).explorerUrl}`);

  const evidence = "a".repeat(64);
  console.log(`3. Envío con evidencia          ${(await chaski.markShipped(orderId, seller.publicKey(), evidence)).explorerUrl}`);

  console.log(`4. Recepción confirmada         ${(await chaski.confirmReceived(orderId, buyer.publicKey())).explorerUrl}`);

  const order = await chaski.getOrder(orderId);
  const rep = await chaski.getReputation(seller.publicKey());
  console.log(`   Estado: ${order.status} · ${order.amount} XLM · reputación vendedor: ${rep.completed} completadas`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
