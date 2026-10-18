# @chaski/sdk

Pagos condicionados (escrow) sobre **Stellar Soroban** en pocas líneas. El dinero queda bloqueado en el contrato y solo se libera cuando se cumple la condición (recepción confirmada, plazo vencido o veredicto del árbitro).

> Estado: **v0.1, testnet**. Lo usa la web de Chaski y se probó de punta a punta desde Node (`web/scripts/sdk-demo.ts`). Todavía no está publicado en npm.

## Uso

```ts
import { Chaski } from "@chaski/sdk";

const chaski = new Chaski({ signer });                                   // 1. conectar
const { value: orderId } = await chaski.createOrder({ seller, amount: 50 }); // 2. vendedor crea la orden
await chaski.fund(orderId, buyer);                                        // 3. comprador bloquea el pago
```

Después: `markShipped` → `confirmReceived` (o `claimAfterTimeout`, `refundIfNotShipped`, `openDispute`, `resolveDispute`).

## Agnóstico de wallet

El `signer` es una función que recibe un XDR y devuelve el XDR firmado. Así se conecta cualquier wallet:

```ts
// Freighter (navegador)
const signer: Signer = async (xdr, { networkPassphrase, address }) =>
  (await signTransaction(xdr, { networkPassphrase, address })).signedTxXdr;

// Backend con Keypair (custodia del integrador)
const signer: Signer = async (xdr, { networkPassphrase }) => {
  const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
  tx.sign(keypair);
  return tx.toXDR();
};
```

Una wallet embebida (por ejemplo Pollar, con login social o passkeys) se integra igual: solo hay que envolver su función de firma.

## API

| Método | Firma | Efecto |
|---|---|---|
| `createOrder({ seller, amount, token?, shipDeadlineSecs?, confirmWindowSecs? })` | vendedor | Crea la orden y devuelve su ID |
| `fund(orderId, buyer)` | comprador | Transfiere el monto al contrato |
| `markShipped(orderId, seller, evidenceHashHex)` | vendedor | Registra el SHA-256 de la evidencia |
| `confirmReceived(orderId, buyer)` | comprador | Libera el pago al vendedor |
| `claimAfterTimeout(orderId, seller)` | vendedor | Cobra si el comprador no confirmó a tiempo |
| `refundIfNotShipped(orderId, buyer)` | comprador | Reembolso si no se despachó a tiempo |
| `openDispute(orderId, caller)` | comprador o vendedor | Congela la orden para el árbitro |
| `resolveDispute(orderId, arbiter, releaseToSeller)` | árbitro | Paga al vendedor o reembolsa al comprador |
| `getOrder(orderId)` / `getReputation(address)` | — | Lecturas sin firma |
| `payUrl(orderId, baseUrl)` / `txUrl(hash)` | — | Link de checkout / explorador |

Cada escritura devuelve `{ txHash, explorerUrl, value }`. Los errores se lanzan como `ChaskiError` con mensajes en español.

`amount` va en unidades del token (7 decimales, igual que XLM y USDC en Stellar). El `token` es la dirección del contrato SAC; por defecto, XLM nativo de testnet.

## Limitaciones conocidas (hoja de ruta)

- Árbitro único global (fijado en `init`): todavía no hay un árbitro por integrador.
- Sin comisión on-chain: el fee de la plataforma no está implementado en el contrato.
- Sin campo de referencia externa para correlacionar con el ID de pedido del integrador.
- Órdenes en `instance` storage: para producción deben pasar a `persistent` con extensión de TTL.
