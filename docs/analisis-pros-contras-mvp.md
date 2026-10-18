# Análisis de Pros y Contras: Trato Seguro vs. Likida y Soluciones Tradicionales

Documento de estrategia técnica y de producto para la **Ideatón Stellar Bolivia 2026**.

---

## 1. El Benchmark: ¿Qué hace Likida hoy?
**Likida** (`likidaapp.com`) opera como un marketplace tradicional cerrado en Bolivia (Santa Cruz, La Paz, Cochabamba) con retención de fondos (escrow centralizado en cuentas bancarias).
- **Su valor:** Valida ante los jueces que la estafa en compras a distancia es un problema masivo y doloroso.
- **Su límite:** Es una plataforma centralizada (Web2). Obliga a compradores y vendedores a descargar una app más, registrarse y canalizar la venta dentro de su catálogo cerrado. La custodia depende 100% de la empresa.

---

## 2. Matriz de Pros y Contras de Trato Seguro

### A Favor (Ventajas Competitivas)

| Factor | Trato Seguro (Stellar / Soroban) | Likida / Tradicional | Impacto en el Proyecto |
|---|---|---|---|
| **Canal de venta** | **No invasivo:** Link de pago compartido directo en WhatsApp, Marketplace o TikTok. | Marketplace cerrado; obliga a publicar y comprar dentro de su app. | Menor fricción de adopción; la gente no abandona donde ya vende. |
| **Custodia de fondos** | **No custodial y transparente:** Fondos bloqueados en contrato inteligente Soroban. | Custodia centralizada en cuentas bancarias de la empresa. | Elimina riesgo de contraparte y problemas de captación de depósitos bancarios. |
| **Moneda / Refugio** | **Dólar digital (USDC):** El dinero mantiene su valor durante los 2–4 días de tránsito. | Bolivianos (BOB) en banco comercial. | Protege contra la devaluación y la escasez de divisas en Bolivia. |
| **Costo y liquidación** | **Fracciones de centavo:** Liquidación en 5 segundos en Stellar. | Comisiones bancarias o pasarelas locales (2–5%). | Margen limpio para cobrar una comisión baja (1–1.5%) siendo altamente rentable. |
| **Reputación auditable** | Historial on-chain inmutable por wallet/identidad. | Reseñas internas manipulables por la plataforma. | Construye confianza real entre ciudades. |

---

### En Contra (Riesgos y Desafíos Técnicos)

| Desafío | Por qué nos juega en contra | Mitigación y Ajuste para el MVP |
|---|---|---|
| **Fricción Web3 / Wallets** | El usuario común de feria o marketplace no tiene Freighter ni USDC; usa QR bancario. | **MVP:** Demo con Freighter y XLM/USDC en testnet para ganar el hackathon.<br>**Pitch (Fase 2):** On-ramp/off-ramp transparente vía Anchors de Stellar integrados a transferencias QR locales. |
| **El Problema del Oráculo (Logística)** | Las flotas y buses interdepartamentales no tienen APIs para consultar si el paquete llegó. | **MVP:** Vendedor sube foto de guía + paquete (hash on-chain). Comprador confirma manualmente o se auto-libera tras `confirm_window_secs` (ej. 72h). En disputas, el árbitro resuelve 2 de 3 con la foto de la guía. |
| **Disputas de mala fe** | El comprador recibe pero afirma que "no llegó nada" o que "está roto". | Esquema multifirma/árbitro (2 de 3) con evidencia visual registrada al despachar. Si no hay reclamo justificado, el contrato libera por tiempo. |

---

## 3. Antecedente Clave de Infraestructura: Pollar (`pollar.xyz`)

Para resolver los rieles bancarios en moneda local (Bs vía QR Simple) sin caer en los problemas de custodia centralizada de Likida:

- **¿Qué es Pollar?** Infraestructura de pagos y orquestación desarrollada en Bolivia sobre la red Stellar por Alejandro Alvarez. Conecta métodos de pago locales (QR boliviano, transferencias) directamente con balances y wallets en Stellar.
- **Relación en el ecosistema:**
  - **Pollar = Capa de onboarding / wallets:** su SDK público (`@pollar/core`, `@pollar/react`) ofrece wallets embebidas con login social, smart wallets y patrocinio de comisiones en Stellar. La conversión Bs ↔ USDC vía QR está **por confirmar** con el equipo de Pollar (su sitio solo menciona "Ramps" de forma genérica).
  - **Trato Seguro = Capa de Aplicación / Escrow:** Es el contrato inteligente en Soroban que bloquea y libera los fondos según eventos de envío y confirmación física.
- **Estrategia para el Hackathon:**
  - **En el Pitch / Deck (Slides 7 y 8):** Se presenta a Pollar como opción de onboarding (wallet embebida, sin Freighter) y la rampa Bs ↔ USDC como próximo paso con un partner local, lo que responde la objeción del jurado sobre cómo paga el usuario de feria sin saber de Web3.
  - **En el MVP (Entrega Domingo 12:00):** Se ejecuta el flujo nativo en Stellar testnet (con Freighter / token SAC) para asegurar el **+10% de bonus** por transacción real on-chain sin bloquear el MVP en dependencias externas o aprobaciones de pasarelas.

---

## 4. Ajustes Concretos para el MVP

1. **Mantener el flujo liviano:**
   - No crear un marketplace ni un catálogo de productos. Solo **creador de órdenes y link de pago**.
2. **Parámetros temporales demostrables en vivo:**
   - En testnet, usar un plazo de prueba corto (ej. 60–120 segundos) para poder demostrar en el video la liberación automática por timeout sin esperar 3 días.
3. **Manejo de evidencia simple:**
   - Almacenar la foto off-chain (local / base64 / Supabase) y guardar únicamente el hash SHA-256 (`BytesN<32>`) en el contrato Soroban para no inflar los costos de almacenamiento on-chain.
4. **Posicionamiento en el Pitch (Slide 6 del Deck):**
   - No vender "otro marketplace". Vender el **Stripe/Escrow descentralizado para el comercio informal boliviano**, apalancado en infraestructura local existente (Pollar).

