# Chaski — Escrow P2P para compras entre ciudades sobre Stellar

> Documento maestro del proyecto para la **Ideatón Stellar Bolivia (17–18 oct 2026)**, track **02 · Pagos y remesas**.
> Este archivo es el contexto para agentes de IA (Claude Code desde la terminal / Antigravity). Léelo completo antes de escribir código.


---

## 0. Instrucciones para el agente de IA

- Idioma: **español** para textos de UI, documentación y comentarios orientados al usuario. Identificadores de código en inglés.
- Prioridad absoluta: **un demo funcionando en Stellar testnet** antes del domingo 18 a las 12:00 (hora Bolivia, UTC-4). El bonus de +10% exige mostrar una transacción real en testnet.
- Mantén el alcance del MVP (sección 6). Si algo no está en el MVP, no lo construyas sin que el equipo lo pida.
- Nunca uses claves de mainnet. Solo testnet. Nunca subas secret keys al repo (usa `.env.local` y `.gitignore`).
- Prefiere soluciones simples y que se puedan demostrar en vivo sobre arquitectura "bonita".
- Antes de cada fase, revisa la checklist de la sección 9 y marca lo terminado.

---

## 1. Resumen en una frase

**Binance P2P, pero para compras por Marketplace, TikTok y WhatsApp con envío por encomienda:** el dinero del comprador queda bloqueado en un contrato inteligente de Stellar y se libera al vendedor solo cuando el paquete llega.

---

## 2. Problema

En Bolivia gran parte del comercio informal se hace por redes sociales entre personas de distintas ciudades (Santa Cruz ↔ La Paz ↔ Cochabamba ↔ El Alto, etc.), con envío por **encomienda en bus**.

- El **comprador** teme pagar por adelantado y no recibir nada (estafas frecuentes con comprobantes falsos, perfiles falsos).
- El **vendedor** teme enviar el producto y no cobrar.
- Las soluciones actuales son informales: videollamadas, "pago contra entrega" (que el vendedor no acepta a distancia), pagar la mitad, confiar en recomendaciones.
- Resultado: ventas que no se concretan, dinero perdido y desconfianza.

> Hipótesis a validar con 5 entrevistas (sección 11): *"Al menos 3 de 5 personas que compran o venden por redes han sido estafadas o han dejado de concretar una compra por desconfianza."*

---

## 3. Solución

Una **web** (sin instalar app) donde:

1. El **vendedor** crea una orden (producto, precio, fotos, ciudad destino) y obtiene un **link de pago** para compartir por WhatsApp/Facebook.
2. El **comprador** abre el link y paga. El monto queda **bloqueado en escrow** (contrato Soroban). El vendedor ve que el pago está asegurado.
3. El vendedor envía la encomienda y sube **número de guía + foto del paquete**. La evidencia se registra con hash on-chain.
4. El comprador recibe y **confirma** → el dinero se libera al vendedor en segundos.
5. Si el comprador no responde en el plazo (ej. 72 h después del envío) → **liberación automática** al vendedor.
6. Si hay un problema → **disputa**: un árbitro decide liberar o devolver (esquema 2 de 3: comprador, vendedor, árbitro).
7. Cada operación exitosa construye una **reputación verificable** on-chain.

### Por qué Stellar
- **Comisiones mínimas** (fracciones de centavo) → viable para compras de Bs 100–2.000.
- **Liquidación en ~5 segundos**.
- **USDC nativo** → el dinero no pierde valor mientras está bloqueado.
- **Soroban** (contratos inteligentes) → reglas del escrow transparentes y que nadie puede manipular, ni siquiera la plataforma.
- Red de **anchors** para entrada/salida de moneda local (visión a futuro).

### Motor reutilizable (visión)
El núcleo es un **motor de pagos condicionados**. El mismo contrato sirve después para:
- Remesas "con destino" (el migrante paga directo el colegio, alquiler o farmacia).
- Pagos por avance de obra (albañiles, carpinteros).
- Pagos a freelancers por entrega.

---

## 4. Usuarios

| Rol | Descripción | Qué necesita |
|---|---|---|
| Vendedor | Emprendedor que vende por Marketplace/TikTok/WhatsApp | Asegurar que le pagarán antes de enviar |
| Comprador | Persona que compra a alguien de otra ciudad | Asegurar que recibirá el producto antes de que se libere su dinero |
| Árbitro | Equipo de la plataforma (MVP) | Resolver disputas con evidencia |

---

## 5. Arquitectura

```
┌───────────────────────┐        ┌──────────────────────────┐
│  Web (Next.js)        │        │  Stellar Testnet         │
│  - Crear orden        │  RPC   │  ┌────────────────────┐  │
│  - Link de pago       │◄──────►│  │ Contrato Escrow    │  │
│  - Estado / disputa   │        │  │ (Soroban, Rust)    │  │
│  - Wallet Freighter   │        │  └─────────┬──────────┘  │
└──────────┬────────────┘        │            │ transfer    │
           │                     │  ┌─────────▼──────────┐  │
           │ fotos (off-chain)   │  │ Token (SAC):       │  │
           ▼                     │  │ XLM nativo o USDC  │  │
   Almacenamiento simple         │  └────────────────────┘  │
   (local / Supabase opcional)   └──────────────────────────┘
   → solo el HASH va on-chain
```

### Stack
- **Contrato:** Rust + `soroban-sdk`, compilado con `stellar` CLI.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind.
- **Stellar en el front:** `@stellar/stellar-sdk` + `@stellar/freighter-api` (o Stellar Wallets Kit).
- **Bindings:** generados con `stellar contract bindings typescript`.
- **Token para demo:** contrato SAC del **XLM nativo** en testnet (más fácil de fondear con Friendbot). USDC de testnet es opcional si queda tiempo.

### Estructura del repo
```
trato-seguro/
├── CLAUDE.md                # este archivo
├── contracts/
│   └── escrow/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs       # contrato
│           └── test.rs      # tests unitarios
├── packages/
│   └── escrow-client/       # bindings TS generados (no editar a mano)
├── web/                     # Next.js
│   ├── app/
│   │   ├── page.tsx                 # landing
│   │   ├── vender/page.tsx          # crear orden
│   │   ├── orden/[id]/page.tsx      # vista comprador/vendedor/estado
│   │   └── arbitro/page.tsx         # panel de disputas
│   ├── lib/stellar.ts               # cliente RPC, wallet, helpers
│   └── .env.local                   # NO subir
├── scripts/
│   ├── deploy.sh            # build + deploy a testnet
│   └── demo.sh              # flujo completo por CLI para el video
└── docs/
    ├── deck.md              # guion de las 8 slides
    ├── entrevistas.md       # notas de las 5 entrevistas
    └── video.md             # guion del video de 3 min
```

---

## 6. Alcance del MVP

### Dentro (obligatorio)
- [x] Contrato escrow con: crear orden, depositar, marcar enviado (con hash de evidencia), confirmar recepción, liberación automática por tiempo, abrir disputa, resolver disputa, consultar orden.
- [x] Tests unitarios del contrato (camino feliz + disputa + timeout).
- [x] Deploy en testnet y transacción demostrable (órdenes #1 feliz, #2 timeout, #3 disputa→reembolso).
- [x] Web con 3 pantallas: crear orden → página de la orden (pagar / marcar enviado / confirmar / disputar) → panel árbitro.
- [x] Conexión con Freighter en testnet. Metadatos, fotos e historial off-chain en Neon (Postgres), opcional vía `DATABASE_URL`.

### Fuera (solo mencionar en el pitch como visión)
- Entrada/salida en bolivianos (QR bancario, anchors).
- Integración directa con empresas de encomiendas.
- Pago parcial / seña.
- App móvil.
- Reputación avanzada y planes de pago.

---

## 7. Especificación del contrato Soroban

### Estados
```
Created → Funded → Shipped → Completed
                      │  └──(timeout)──► Completed
                      └──► Disputed ──► Completed (a vendedor) | Refunded (a comprador)
Funded ──(vendedor no envía en plazo)──► Refunded (comprador puede reclamar)
```

### Tipos
```rust
#[contracttype]
pub enum Status { Created, Funded, Shipped, Completed, Disputed, Refunded }

#[contracttype]
pub struct Order {
    pub id: u64,
    pub seller: Address,
    pub buyer: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub status: Status,
    pub evidence_hash: Option<BytesN<32>>, // hash de foto + guía
    pub created_at: u64,
    pub funded_at: u64,
    pub shipped_at: u64,
    pub ship_deadline_secs: u64,    // plazo para enviar tras el pago
    pub confirm_window_secs: u64,   // plazo para confirmar tras el envío
}

#[contracttype]
pub struct Reputation { pub completed: u32, pub disputes_lost: u32 }
```

### Funciones
| Función | Quién firma | Efecto |
|---|---|---|
| `init(admin, arbiter)` | admin | Configura árbitro. Una sola vez. |
| `create_order(seller, token, amount, ship_deadline_secs, confirm_window_secs) -> u64` | seller | Crea orden en `Created`. |
| `fund(order_id, buyer)` | buyer | Transfiere `amount` del comprador al contrato. → `Funded`. |
| `mark_shipped(order_id, evidence_hash)` | seller | Registra hash de evidencia. → `Shipped`. |
| `confirm_received(order_id)` | buyer | Transfiere al vendedor. → `Completed`. Suma reputación. |
| `claim_after_timeout(order_id)` | seller | Si `Shipped` y venció `confirm_window_secs` → paga al vendedor. |
| `refund_if_not_shipped(order_id)` | buyer | Si `Funded` y venció `ship_deadline_secs` → devuelve al comprador. |
| `open_dispute(order_id, caller)` | buyer o seller | Solo desde `Shipped`. → `Disputed`. |
| `resolve_dispute(order_id, release_to_seller: bool)` | arbiter | Paga a quien corresponda. Actualiza reputación. |
| `get_order(order_id) -> Order` | — | Lectura. |
| `get_reputation(addr) -> Reputation` | — | Lectura. |

### Reglas importantes
- Usar `addr.require_auth()` en cada función que mueve fondos o cambia estado.
- Transferencias con `token::Client::new(&env, &order.token)`:
  - depósito: `transfer(&buyer, &env.current_contract_address(), &amount)`
  - pago: `transfer(&env.current_contract_address(), &to, &amount)`
- Tiempo con `env.ledger().timestamp()`.
- Validar transiciones de estado; cualquier transición inválida → `panic_with_error!` con un `#[contracterror]` claro.
- `amount > 0`; el comprador no puede ser el vendedor.
- Emitir eventos (`env.events().publish`) en cada cambio de estado para que la web los muestre.
- Para el demo, permitir plazos cortos (ej. 60 s) para mostrar la liberación automática en vivo.

### Tests mínimos (`test.rs`)
1. Camino feliz: create → fund → ship → confirm → saldo del vendedor correcto.
2. Timeout: create → fund → ship → avanzar ledger → `claim_after_timeout` ok.
3. No envío: create → fund → avanzar ledger → `refund_if_not_shipped` ok.
4. Disputa resuelta a favor del comprador → reembolso.
5. Llamadas no autorizadas / transiciones inválidas fallan.

---

## 8. Comandos (Stellar CLI)

```bash
# Requisitos: Rust, target wasm, stellar CLI
rustup target add wasm32v1-none
cargo install --locked stellar-cli   # o según la doc oficial de Stellar

# Identidades de testnet fondeadas con Friendbot
stellar keys generate vendedor  --network testnet --fund
stellar keys generate comprador --network testnet --fund
stellar keys generate arbitro   --network testnet --fund

# Crear el proyecto del contrato
stellar contract init . --name escrow

# Compilar y testear
stellar contract build
cargo test

# Desplegar (la ruta del .wasm puede variar según versión: revisa target/)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source vendedor --network testnet --alias escrow

# ID del token XLM nativo en testnet (SAC)
stellar contract id asset --asset native --network testnet

# Inicializar
stellar contract invoke --id escrow --source vendedor --network testnet -- \
  init --admin vendedor --arbiter arbitro

# Bindings TypeScript para la web
stellar contract bindings typescript --network testnet \
  --id escrow --output-dir packages/escrow-client
```

> Si un comando falla por cambios de versión del CLI, revisar `stellar --help` y la documentación oficial en developers.stellar.org antes de improvisar.

`scripts/demo.sh` debe ejecutar el flujo completo (create → fund → mark_shipped → confirm) imprimiendo los hashes de transacción y links a un explorador de testnet (stellar.expert/explorer/testnet) para mostrarlos en el video.

---

## 9. Plan de trabajo y checklist (hora Bolivia)

### Sábado 17
- **11:30–14:30**
  - Negocio: 5 entrevistas (guía en sección 11) → `docs/entrevistas.md`.
  - Dev: contrato + tests + deploy testnet.
  - Diseño: wireframes de las 3 pantallas.
- **14:30–18:00**
  - Dev: web conectada al contrato (crear orden, pagar, enviar, confirmar).
  - Negocio: deck en borrador con citas de entrevistas.
- **21:00** — Primer check en la plataforma (obligatorio).

### Domingo 18
- **08:00–10:00** — Pulir demo, panel de árbitro, `demo.sh`.
- **10:00–11:15** — Grabar video de 3 min (guion sección 12) y cerrar deck.
- **11:30** — Entregar (cierre a las 12:00, no apurarse al límite).

---

## 10. Deck de 8 slides

1. **Problema** — "Comprar a alguien de otra ciudad en Bolivia es un acto de fe." Dato/cita de entrevistas + ejemplo de estafa real.
2. **Validación** — Resultados de las 5 entrevistas: cuántos fueron estafados, cuánto perdieron, qué hacen hoy para protegerse.
3. **Solución** — Trato Seguro: link de pago + dinero bloqueado hasta que llegue el paquete. Flujo en 4 pasos con capturas.
4. **Por qué Stellar** — Comisiones mínimas, 5 segundos, USDC, Soroban transparente, reputación que no se puede falsificar.
5. **Demo / producto** — Capturas + hash de transacción real en testnet.
6. **Modelo de negocio** — Comisión 1–2% por transacción protegida; plan "Vendedor verificado". Comparación: 1,5% vs perder el 100% en una estafa.
7. **Mercado y visión** — Comercio por redes en Bolivia; el mismo motor sirve para remesas con destino, pagos por avance de obra y freelancers.
8. **Equipo y plan de validación** — Roles; próximos pasos: piloto con 20 vendedores de Marketplace, entrada en bolivianos vía anchor local (Pollar / QR bancario), alianza con empresas de encomiendas.

---

## 11. Guía de entrevistas (meta: 5)

Perfil: personas que **compran o venden por Facebook Marketplace, TikTok o WhatsApp** a otras ciudades.

1. ¿Con qué frecuencia compras/vendes a alguien de otra ciudad?
2. ¿Cómo se hace el pago y el envío normalmente?
3. ¿Alguna vez te estafaron o casi? ¿Qué pasó? ¿Cuánto perdiste?
4. ¿Dejaste de comprar/vender alguna vez por desconfianza?
5. ¿Qué haces hoy para protegerte? (videollamada, adelanto, recomendaciones…)
6. Si el dinero quedara "congelado" por un tercero confiable hasta que llegue el paquete, ¿lo usarías?
7. ¿Pagarías 1–2% por esa protección? ¿Quién debería pagarla, comprador o vendedor?
8. ¿Tienes o usarías dólares digitales (USDT/USDC)?

Registrar en `docs/entrevistas.md`: perfil, ciudad, respuestas clave y **una cita textual** por persona (sirve para el deck y el video).

---

## 12. Guion del video (3 min)

- **0:00–0:30** — Historia real de una estafa (de las entrevistas).
- **0:30–1:00** — El problema en números (validación).
- **1:00–2:00** — Demo: vendedor crea link → comprador paga (dinero bloqueado) → vendedor sube guía → comprador confirma → mostrar la transacción en el explorador de testnet.
- **2:00–2:30** — Por qué Stellar + modelo de negocio.
- **2:30–3:00** — Visión (motor de pagos condicionados) + equipo + cierre.

---

## 13. Criterios de evaluación (para priorizar)

| Criterio | Peso | Cómo lo cubrimos |
|---|---|---|
| Problema validado con entrevistas | 25% | 5 entrevistas con citas y números |
| Pitch | 25% | Historia real + demo en vivo |
| Solución y por qué Stellar | 20% | Soroban escrow + USDC + comisiones mínimas |
| Viabilidad y modelo de negocio | 20% | Comisión 1–2%, plan vendedores |
| Equipo y plan | 10% | Roles claros + piloto concreto |
| **Bonus** | +10% | Transacción funcionando en testnet |

---

## 14. Prompts sugeridos para empezar desde la terminal

```text
Lee CLAUDE.md. Crea el contrato Soroban de la sección 7 en contracts/escrow con sus tests de la sección 7, y verifica que cargo test pase.
```
```text
Lee CLAUDE.md. Escribe scripts/deploy.sh y scripts/demo.sh según la sección 8 y ejecútalos contra testnet.
```
```text
Lee CLAUDE.md. Crea la web Next.js de la sección 5 con las 3 pantallas del MVP, conectada a Freighter y a los bindings de packages/escrow-client.
```
