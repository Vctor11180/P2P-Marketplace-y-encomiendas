# Chaski — Escrow P2P & Encomiendas Seguras en Stellar

> **Ideatón Stellar Bolivia 2026** — Track 02: Pagos y Remesas  
> Protocolo de pagos condicionados y custodia descentralizada para comercio interdepartamental en Bolivia.

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-success?style=flat-square&logo=stellar)](https://stellar.expert/explorer/testnet/contract/CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban%20(Rust)-orange?style=flat-square)](https://soroban.stellar.org)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Neon Database](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech)
[![Freighter Wallet](https://img.shields.io/badge/Wallet-Freighter-purple?style=flat-square)](https://freighter.app)

---

## 📁 Carpeta Oficial de Evidencia y Grabaciones (Google Drive)
Todos los registros de audio/video de las entrevistas de campo, recursos multimedia y material de validación del proyecto se encuentran respaldados en la nube:

🔗 **[Acceder a la Carpeta de Google Drive del Proyecto](https://drive.google.com/drive/folders/1qLMssL-501MLKVg4dMtOnxekt-u1ckk5?usp=sharing)**

---

## 1. El Problema Central
En Bolivia, comprar o vender a alguien de otra ciudad por **Facebook Marketplace, WhatsApp o TikTok** es un acto de fe ciega:
- **El comprador teme:** *"Si transfiero antes, me bloquean y nunca mandan el paquete por la flota."*
- **El vendedor teme:** *"Si mando la encomienda primero, nunca me depositan."*
- **Consecuencia:** ventas que nunca se concretan entre La Paz, Santa Cruz, Cochabamba y el resto del país por pura desconfianza.

**Chaski** resuelve esto sustituyendo la confianza ciega por un **contrato inteligente en Soroban**: el dinero del comprador queda congelado de forma neutral e inmutable hasta que la encomienda llega a destino y se confirma la recepción.

---

## 2. Validación con Usuarios Reales (6 Entrevistas de Campo)
Durante la Ideatón Stellar 2026 salimos a entrevistar a personas reales (compradores, vendedores y público general) sobre sus experiencias de compra por internet. Los resultados fueron contundentes:

- **6 de 6** sienten desconfianza al transferir a desconocidos por redes sociales.
- **4 de 6** fueron estafados o dejaron de comprar por desconfianza (cancelaron tratos, limitan sus compras o no compran a distancia). **La hipótesis (≥3 de 5) se confirma.**
- **1 caso de estafa real documentado:** Luna Gallego pagó el 50% de anticipo por artículos del hogar y la bloquearon de inmediato.
- **6 de 6** usarían un sistema neutral que congele los fondos hasta verificar el paquete.
- **6 de 6** aceptan una comisión del 1%–2% a cambio de esa garantía.
- **4 de 6** sostienen que el **vendedor debe asumir el fee** como señal de legitimidad; 1 propone dividirlo 50/50.

> Muestra pequeña (6 personas, La Paz, durante la Ideatón): valida el problema, no el tamaño de mercado. El próximo paso es un piloto con 20 vendedores reales.

### Matriz de Validación de Campo

| # | Participante | Perfil | ¿Estafado? | Comportamiento frente al Riesgo | ¿Usaría Escrow? | Comisión (1%–2%) | Cita Textual Destacada |
|---|---|---|---|---|---|---|---|
| 1 | **[Belén Mejía](docs/entrevistas/entrevista-1-belen-mejia.md)** | Consumidora potencial | No | Paga solo el 50% adelantado como escudo | Sí (100%) | Sí (paga el vendedor) | *"Por seguridad siempre pago la mitad, y ya cuando llegue y esté todo bien, el resto."* |
| 2 | **[Alejandro Bolívar](docs/entrevistas/entrevista-2-alejandro-bolivar.md)** | Comprador de tecnología | Casi (temor) | Limita sus compras tech a 1 vez cada 6 meses por miedo | Sí (exige KYC) | Sí (mitad y mitad 50/50) | *"No compro mucho porque me da inseguridad que te estafen; una vez cada seis meses para probar."* |
| 3 | **[Daniel Cueto](docs/entrevistas/entrevista-3-daniel-cueto.md)** | Comprador/vendedor P2P | Casi (presión) | Canceló compras atractivas por actitud sospechosa y hostigamiento | Sí (garantía) | Sí (paga el vendedor) | *"Claro que cancelé compras: la persona empieza a tener un comportamiento extraño y hostigarte para que pagues antes."* |
| 4 | **[Julieta Stein](docs/entrevistas/entrevista-4-julieta-stein.md)** | Novata en Web3 | No | No compra a distancia por desconfianza | Sí (anti-estafa) | Sí (paga el vendedor) | *"El vendedor debería pagar diciendo: «Esto es real, quiero que concretemos la venta, voy a pagar para que confíes en mí»."* |
| 5 | **[Kevin Guzmán](docs/entrevistas/entrevista-5-kevin-guzman.md)** | Comprador mensual en FB | Casi (miedo) | Miedo constante por falta de verificación en Facebook | Sí (comprar en paz) | Sí (paga el vendedor) | *"En Facebook no hay nada que te certifique que la cuenta es real. Da mucha desconfianza transferir."* |
| 6 | **[Luna Gallego](docs/entrevistas/entrevista-6-luna-gallego.md)** | Compradora semanal | **SÍ (Estafada)** | **Perdió el 50% de anticipo** y fue bloqueada de inmediato | Sí (trazabilidad) | Sí (modelo seguro) | *"Compraba algo para mi casa, me dijeron que pagara la mitad... les pagué la mitad y me bloquearon."* |

---

## 3. Smart Contracts & Despliegue en Stellar Testnet

El núcleo de Chaski es un smart contract escrito en Rust para Soroban, con tests unitarios y probado de punta a punta en Testnet (no tiene auditoría de seguridad externa):

- **Network:** Stellar Testnet (`https://soroban-testnet.stellar.org`)
- **Contract ID:** [`CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X`](https://stellar.expert/explorer/testnet/contract/CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X)
- **Token Nativo SAC (XLM Testnet):** [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- **Billetera Oficial de Arbitraje:** `GBXGA7ZIXQ2XXXI2UKN6P73W2TRKLJPKKKZCX2L7W2C4Z5OPAN2PWUWZ`

### Funciones Principales del Contrato (`contracts/escrow/src/lib.rs`):
1. `create_order(...)` — Inicializa la orden con vendedor, monto, plazo de despacho y ventana de confirmación.
2. `fund(...)` — El comprador deposita los fondos; el contrato asume la custodia neutral.
3. `mark_shipped(...)` — El vendedor ancla on-chain el hash SHA-256 de la evidencia (empresa de flota + guía + foto del paquete); los datos en sí quedan off-chain.
4. `confirm_received(...)` — El comprador libera los fondos al vendedor y se suma reputación positiva.
5. `claim_after_timeout(...)` — Si el comprador no responde en el plazo fijado, el vendedor cobra automáticamente.
6. `refund_if_not_shipped(...)` — Si el vendedor no despacha a tiempo, el comprador recupera su dinero sin mediador.
7. `open_dispute(...)` — Congela la liberación automática en caso de paquete roto o guía falsa.
8. `resolve_dispute(...)` — El árbitro evalúa la evidencia criptográfica y dictamina si reembolsa o libera.
9. `get_order(...)` & `get_reputation(...)` — Lecturas públicas de órdenes y reputación inmutable.

### Transacciones verificadas en Testnet

Todas las rutas del contrato se ejecutaron en testnet desde tres clientes distintos: la **web con Freighter**, el **SDK desde Node** y el **CLI de Stellar**.

| Orden | Camino | Cliente | Transacciones |
|---|---|---|---|
| #4 "Chompa de alpaca" | Camino feliz | Web + Freighter | [crear](https://stellar.expert/explorer/testnet/tx/6dc1e7e013461b7df9cf7fa0ad6a5f75f4162ae396d9cf8bcd6ddd8233192f34) → [pagar](https://stellar.expert/explorer/testnet/tx/a94de9b03562144d940867d299134041b65c2e157667ce67f23b4fa5de8b25d3) → [enviar](https://stellar.expert/explorer/testnet/tx/35e2bf679c44ded2bc4ccad6fb2a2f5aa81aeb1a4f7cc164dea354200f4fc7d2) → [confirmar](https://stellar.expert/explorer/testnet/tx/937b6423a6e4c82f6fe941dd9003e422134914a9a16f044f91846aabb2aad563) |
| #5 "Zapatillas" | Disputa → árbitro | Web + Freighter | [crear](https://stellar.expert/explorer/testnet/tx/cefce6ace4ff47fd804b97d09c5d17da6d7a496ce1a91a743df83c1b21f6a875) → [pagar](https://stellar.expert/explorer/testnet/tx/1be6f7ba3ee0bc016e5d9bce52add9b7cd7e39b9cc47b1fed279eebac9bbdd99) → [enviar](https://stellar.expert/explorer/testnet/tx/ddaa3d12e09a008455fb3b8299e7244aca4335591336a3deff10db00f58f1f72) → [disputa](https://stellar.expert/explorer/testnet/tx/8b842a9843dd6e4930b02581c4ca849232a98da22a69f5b629f79fc29952bda2) → [veredicto](https://stellar.expert/explorer/testnet/tx/47776a4811d044bbb879b53290a3d22d886b28f28b3b4b0e81f673d3544715a9) |
| #6 | Camino feliz | **@chaski/sdk** (Node, Keypair) | [crear](https://stellar.expert/explorer/testnet/tx/6e38816e056df7f40ede466d8c52faded2be88543b1c45531f1cdfccfa44cf70) → [pagar](https://stellar.expert/explorer/testnet/tx/d5810db0fadf6973621170e4bc31fdde2e6a5d1733e8e2ae1be04c751ff9f7d1) → [enviar](https://stellar.expert/explorer/testnet/tx/076bed2ba78ecbb40c8b221dc0d8f484e3842778290668c346844ad77494d392) → [confirmar](https://stellar.expert/explorer/testnet/tx/ffe1a80fae9a49b1eceb4f833667a113d9113fe52a65d02344109e445e34074b) |
| #2 | Liberación automática por plazo | CLI | [cobro tras timeout](https://stellar.expert/explorer/testnet/tx/30828bff6f7bfa265b31e5e41d0a4c8a305a62ab0771cb476827a8df39c02fe4) (el intento antes del plazo fue rechazado por el contrato) |
| #3 | Disputa → reembolso | CLI | [pagar](https://stellar.expert/explorer/testnet/tx/9891616342dd5e2b439f1c26c00f1ec34dda4c7be10e9db9cfd75717e0cfaee5) → [enviar](https://stellar.expert/explorer/testnet/tx/f2924783bec57c4f157e4b0d7df2cfadac7b7e86872a132b893e784d960b2e13) → [disputa](https://stellar.expert/explorer/testnet/tx/54dc7a8351e4771979db2ee7985c36258c38945e057c18c2e29959545d02a8d3) → [reembolso](https://stellar.expert/explorer/testnet/tx/48bb19a163f494ca54bd00b6ea45995ae570fc20cd6305957484d19c7f56113f) (un tercero que intentó resolver fue rechazado) |

---

## 4. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN WEB                         │
│   Next.js 16 (App Router + Turbopack) · Tailwind CSS v4          │
│   Conexión con Freighter Wallet · Vistas de Rol dinámicas        │
└──────────────────────────┬───────────────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────────────────────┐   ┌───────────────────────────────┐
│     SOROBAN SMART CONTRACT   │   │      NEON POSTGRES (OFF-CHAIN)│
│  · Custodia de Fondos (XLM)  │   │  · Título y Ciudades (Origen) │
│  · Estados: Created/Funded/  │   │  · Fotos comprimidas (Guía/   │
│    Shipped/Completed/Dispute │   │    Reclamo del comprador)     │
│  · Hash SHA-256 de Evidencia │   │  · Historial de transacciones │
│  · Reputación on-chain       │   │  * La app funciona aún sin BD │
└──────────────────────────────┘   └───────────────────────────────┘
```

### Integridad Criptográfica de la Evidencia:
Cuando el vendedor despacha la encomienda, el sistema calcula:
$$\text{SHA-256}(\text{"CHASKI-EVIDENCIA"} \parallel \text{Empresa} \parallel \text{Guía} \parallel \text{Foto})$$
Ese hash exacto se ancla en el contrato de Soroban. La aplicación web recalcula el hash en tiempo real y marca en verde: **"✓ Coincide con el hash registrado on-chain"**, garantizando que ninguna de las partes pueda manipular o cambiar la foto posteriormente.

---

## 5. De app a protocolo: `@chaski/sdk`

La web de Chaski es **un integrador más** del contrato. Toda la lógica on-chain vive en [`packages/chaski-sdk`](packages/chaski-sdk), un SDK TypeScript **agnóstico de wallet**: recibe una función `signer`, así que sirve con Freighter, una wallet embebida o un backend con Keypair.

```ts
import { Chaski } from "@chaski/sdk";

const chaski = new Chaski({ signer });                                       // Freighter, wallet embebida o Keypair
const { value: orderId } = await chaski.createOrder({ seller, amount: 50 }); // link de pago: chaski.payUrl(orderId, url)
await chaski.fund(orderId, buyer);                                            // el dinero queda en custodia del contrato
```

- **Web (navegador):** [`web/lib/stellar.ts`](web/lib/stellar.ts) conecta Freighter como signer.
- **Backend (Node):** [`web/scripts/sdk-demo.ts`](web/scripts/sdk-demo.ts) firma con Keypair y ejecuta el flujo completo; es la orden #6 de la tabla de arriba.
- Documentación de la API: [`packages/chaski-sdk/README.md`](packages/chaski-sdk/README.md).

---

## 6. Estado: Hoy · Próximo · Visión

Separamos lo que funciona hoy de lo que es hoja de ruta.

### ✅ Hoy (funcionando en testnet)
- Contrato escrow en Soroban: crear, pagar, enviar con hash de evidencia, confirmar, liberación automática por plazo, reembolso por no envío, disputa y arbitraje, reputación on-chain.
- Web con link de pago compartible, vistas por rol y panel de árbitro.
- Evidencia verificable: foto + guía off-chain (Neon) y su SHA-256 on-chain.
- `@chaski/sdk` v0.1, usado por la web y probado desde Node.
- Token configurable por orden: el demo usa XLM de testnet; el mismo contrato acepta USDC (SAC).

### 🔜 Próximo (piloto)
- **Onboarding sin cripto:** wallets embebidas con login social o passkeys y comisiones patrocinadas. Evaluamos [Pollar](https://pollar.xyz), un SDK de wallets embebidas para Stellar, que se conectaría como `signer` del SDK.
- **Entrada y salida en bolivianos:** rampa Bs ↔ USDC vía QR bancario con un anchor o partner local (por confirmar).
- **Contrato v2:** comisión on-chain (`fee_bps`), árbitro por integrador, referencia externa del pedido, órdenes en `persistent` storage y códigos de error tipados.
- **SDK para terceros:** publicar en npm, webhooks y API keys.
- Piloto con 20 vendedores de Marketplace y USDC en mainnet.

### 🔭 Visión (motor de pagos condicionados)
El contrato no sabe qué custodia: el mismo motor sirve para **pagos por hitos** (freelance, obras), **remesas con destino** (colegio, salud) y **ahorro grupal tipo pandero/vaquita** con custodia neutral. No conocemos una implementación de vaquita on-chain pensada para el mercado boliviano.

---

## 7. Documentación y Recursos del Proyecto

- 📑 **[Pitch Deck de 8 Slides](docs/deck.md):** Estructura completa de la presentación con datos de validación y modelo de negocio.
- 🎬 **[Guion del Video Demo (3 min)](docs/video.md):** Guion cronometrado minuto a minuto para la grabación de la entrega.
- 🌐 **[Visión de Producto y SDK (@chaski/sdk)](docs/chaski-protocol-vision.md):** Arquitectura del protocolo, ahorro grupal (*Vaquita on-chain*), pagos por hitos y posibles alianzas (Pollar, Likida, Trestlework).
- 📊 **[Análisis Pros y Contras MVP](docs/analisis-pros-contras-mvp.md):** Comparativa frente a soluciones bancarias y marketplaces locales.
- 🎙️ **[Registro de Entrevistas de Validación](docs/entrevistas.md):** Transcripciones verbatim y hojas de trabajo de las 6 entrevistas.

---

## 8. Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+
- Extensión [Freighter Wallet](https://freighter.app) configurada en **Testnet** con fondos de prueba.

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/Vctor11180/P2P-Marketplace-y-encomiendas.git
cd P2P-Marketplace-y-encomiendas/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env.local)
cp .env.example .env.local
# (Completar con DATABASE_URL de Neon y claves de prueba)

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador con Freighter conectado.

> `npm install` copia `packages/chaski-sdk` dentro de `web/node_modules` (ver `web/.npmrc`). Si editás el SDK, corré `npm run sdk:sync` para refrescarlo.

### Probar el SDK desde Node (sin navegador)
```bash
cd web
CHASKI_SELLER_SECRET=S... CHASKI_BUYER_SECRET=S... npx tsx scripts/sdk-demo.ts
```

### Contrato
```bash
cd contracts/escrow
cargo test              # tests unitarios
stellar contract build  # compila el WASM
```

---

## 9. Equipo

| Integrante | Rol |
|---|---|
| **Victor Hugo Murillo Siles** | Desarrollador Full Stack: contrato Soroban (Rust), `@chaski/sdk`, backend (Neon) y despliegue en testnet/Vercel. |
| **Ronald Augusto Rodríguez Serrano** | Desarrollador Frontend y Comunicación: interfaz web, video y pitch; condujo las 6 entrevistas de validación. |
