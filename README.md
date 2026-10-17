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
- **Consecuencia:** Millones de bolivianos en ventas que nunca se concretan entre La Paz, Santa Cruz, Cochabamba y el resto del país por pura desconfianza.

**Chaski** resuelve esto sustituyendo la confianza ciega por un **contrato inteligente en Soroban**: el dinero del comprador queda congelado de forma neutral e inmutable hasta que la encomienda llega a destino y se confirma la recepción.

---

## 2. Validación con Usuarios Reales (6 Entrevistas de Campo)
Durante la Ideatón Stellar 2026 salimos a entrevistar a personas reales (compradores, vendedores y público general) sobre sus experiencias de compra por internet. Los resultados fueron contundentes:

- **100% (6/6)** confirman desconfianza crónica al transferir a desconocidos, compras canceladas o compras limitadas por miedo al fraude.
- **1 caso de estafa real documentado:** Luna Gallego fue estafada pagando el 50% de anticipo para artículos del hogar con bloqueo inmediato en redes.
- **100% de aceptación del Escrow:** Todos los entrevistados usarían un sistema neutral que congele los fondos hasta verificar el paquete.
- **100% de disposición de pago:** Aceptan pagar una comisión del 1%–2% a cambio de garantía total.
- **80% de consenso comercial:** Sostienen que el **vendedor debe asumir el fee**, ya que dar seguridad es su mayor palanca para cerrar ventas.

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

El núcleo de Chaski es un smart contract escrito en Rust para el entorno Soroban, auditado funcionalmente en Testnet:

- **Network:** Stellar Testnet (`https://soroban-testnet.stellar.org`)
- **Contract ID:** [`CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X`](https://stellar.expert/explorer/testnet/contract/CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X)
- **Token Nativo SAC (XLM Testnet):** [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- **Billetera Oficial de Arbitraje:** `GBXGA7ZIXQ2XXXI2UKN6P73W2TRKLJPKKKZCX2L7W2C4Z5OPAN2PWUWZ`

### Funciones Principales del Contrato (`contracts/escrow/src/lib.rs`):
1. `create_order(...)` — Inicializa la orden con vendedor, monto, plazo de despacho y ventana de confirmación.
2. `fund_order(...)` — El comprador deposita los fondos; el contrato asume la custodia neutral.
3. `mark_shipped(...)` — El vendedor ancla la empresa de flota, guía y el hash SHA-256 de la foto del paquete.
4. `confirm_received(...)` — El comprador libera los fondos al vendedor y se suma reputación positiva.
5. `claim_after_timeout(...)` — Si el comprador no responde en el plazo fijado, el vendedor cobra automáticamente.
6. `refund_if_not_shipped(...)` — Si el vendedor no despacha a tiempo, el comprador recupera su dinero sin mediador.
7. `open_dispute(...)` — Congela la liberación automática en caso de paquete roto o guía falsa.
8. `resolve_dispute(...)` — El árbitro evalúa la evidencia criptográfica y dictamina si reembolsa o libera.
9. `get_order(...)` & `get_reputation(...)` — Lecturas públicas de órdenes y reputación inmutable.

### Transacciones Verificadas en Vivo (Testnet Explorer):
- **Liberación automática por timeout:** [Tx 30828bff...](https://stellar.expert/explorer/testnet/tx/30828bff6f7bfa265b31e5e41d0a4c8a305a62ab0771cb476827a8df39c02fe4) → Orden completada tras vencer el plazo sin respuesta del comprador.
- **Disputa con reembolso por Árbitro:** [Tx 48bb19a1...](https://stellar.expert/explorer/testnet/tx/48bb19a163f494ca54bd00b6ea45995ae570fc20cd6305957484d19c7f56113f) → Comprador recuperó los fondos tras fallo del árbitro.
- **Camino Feliz completo (Orden #4):**
  - Creación de orden: [Tx 6dc1e7e0...](https://stellar.expert/explorer/testnet/tx/6dc1e7e04f67645069a5fa1c2feee8ffef86060c4bc17ce1ce446a8933192f34)
  - Fondeo y bloqueo en Escrow: [Tx a94de9b0...](https://stellar.expert/explorer/testnet/tx/a94de9b09bfbc994270bc2326ef26e578c772cb80ea697fa29707e4d8b25d301)
  - Envío y confirmación con reputación registrada.

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

## 5. Documentación y Recursos del Proyecto

- 📑 **[Pitch Deck de 8 Slides](docs/deck.md):** Estructura completa de la presentación con datos de validación y modelo de negocio.
- 🎬 **[Guion del Video Demo (3 min)](docs/video.md):** Guion cronometrado minuto a minuto para la grabación de la entrega.
- 🌐 **[Visión de Producto y SDK (@chaski/sdk)](docs/chaski-protocol-vision.md):** Arquitectura del protocolo, ahorro grupal (*Vaquita on-chain*), pagos por hitos y alianzas (Pollar, Likida, Trestlework).
- 📊 **[Análisis Pros y Contras MVP](docs/analisis-pros-contras-mvp.md):** Comparativa frente a soluciones bancarias y marketplaces locales.
- 🎙️ **[Registro de Entrevistas de Validación](docs/entrevistas.md):** Transcripciones verbatim y hojas de trabajo de las 6 entrevistas.

---

## 6. Instalación y Ejecución Local

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
