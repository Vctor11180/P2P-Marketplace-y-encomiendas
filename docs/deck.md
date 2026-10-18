# Pitch Deck — Chaski: Pagos P2P y Encomiendas Seguras en Stellar

> **Track:** Track 02 — Pagos y Remesas  
> **Hackathon:** Ideatón Stellar Bolivia 2026  
> **Formato:** 8 Slides para presentación / PDF

---

## Slide 1: Portada y Problema Central
**Título:** Chaski — Comercio interdepartamental sin miedo  
**Subtítulo:** Escrow descentralizado en Soroban para envíos y encomiendas en Bolivia.  
**Gancho:**
> *"Comprar o vender a alguien de otra ciudad en Bolivia hoy es un acto de fe ciega."*
- **Historia real (Luna Gallego):** *"Quería comprar artículos para mi casa por Facebook... me pidieron el 50% de anticipo, transferí y me bloquearon al instante."*
- Comprador: *"Tengo miedo de transferir y que me bloqueen sin enviar nada."*
- Vendedor: *"No puedo despachar por encomienda si no veo el dinero primero."*
- **Consecuencia:** Millones de bolivianos en ventas que nunca se concretan por pura desconfianza.

---

## Slide 2: Validación con Usuarios Reales
**Título:** Hablamos con compradores y vendedores en Bolivia (Ideatón Stellar 2026)
**Hallazgos clave (6 entrevistas estructuradas):**
- **1 caso de estafa real documentado:** Luna Gallego (compradora semanal) estafada con el 50% de anticipo.
- **6 de 6** sienten desconfianza al transferir a desconocidos por redes.
- **4 de 6** fueron estafados o dejaron de comprar por desconfianza (cancelaron tratos, limitan compras o no compran a distancia) → **hipótesis confirmada (meta: ≥3 de 5)**.
- **6 de 6** usarían un sistema que congele el dinero de forma neutral hasta que el paquete llegue.
- **6 de 6** aceptan pagar 1%–2%: pagar 1.5% por seguridad es poco frente a perder el 50% o el 100% en una estafa.
- **4 de 6** sostienen que el **vendedor** debe asumir el fee como señal de legitimidad (1 propone 50/50).
- **Citas destacadas:**
> *"Una vez estaba comprando algo para mi casa, les pagué la mitad por adelantado... y me bloquearon."* — Luna Gallego  
> *"El vendedor debería pagar una comisión diciendo: «Mira, esto es real, quiero que concretemos esta venta, entonces voy a pagar algo para que confíes en mí»."* — Julieta Stein Ortiz  
> *"En Facebook no hay nada que te certifique que la persona es real. Da mucha desconfianza hacer una transferencia."* — Kevin Guzmán



---

## Slide 3: La Solución — Chaski
**Título:** Pagos condicionados y custodia neutral en 4 pasos
1. **Crear orden:** El vendedor genera un link de pago con monto (XLM / USDC), destino y plazos.
2. **Custodia en Soroban:** El comprador deposita. El dinero queda bloqueado de forma inmutable en el smart contract (nadie puede tocarlo arbitrariamente).
3. **Despacho con prueba criptográfica:** El vendedor sube la foto de la encomienda y número de guía. Se genera un hash SHA-256 on-chain inalterable.
4. **Liberación o resolución:** Cuando el comprador recibe el paquete, confirma y el contrato libera los fondos al vendedor al instante. Si hay problema, interviene un árbitro o reembolso automático por timeout.

---

## Slide 4: Por qué Stellar y Soroban
**Título:** La infraestructura financiera ideal para micropagos y comercio real
- **Costos casi nulos:** Tarifas de fracciones de centavo (~$0.00001), haciendo viable proteger compras desde 20 Bs sin comisiones abusivas.
- **Velocidad de liquidación:** 3 a 5 segundos de finalidad por bloque en Stellar.
- **Contratos inteligentes transparentes (Soroban):** Las reglas de liberación, timeout y disputa son código auditable, no la promesa de una empresa privada.
- **Moneda estable (USDC):** el contrato ya acepta cualquier token SAC; con USDC el dinero no pierde valor mientras está bloqueado.
- **Ecosistema para onboarding:** wallets embebidas con login social o passkeys y comisiones patrocinadas (ej. Pollar) para que el usuario no vea cripto. Rampa Bs ↔ USDC por QR vía anchor o partner local (próximo paso).

---

## Slide 5: Producto y Demostración en Testnet
**Título:** MVP funcional y comprobable en Stellar Testnet
- **Smart Contract desplegado:** `CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X`
- **Web App moderna:** Conexión nativa con Freighter Wallet, roles dinámicos (vendedor, comprador, árbitro) y metadata off-chain en Neon.
- **Verificación de evidencia:** Comparación en vivo entre SHA-256 off-chain y hash on-chain.
- **@chaski/sdk v0.1:** la web es un integrador más; el mismo flujo corre desde un backend Node sin Freighter (orden #6).
- **Transacciones reales ejecutadas (6 órdenes, 3 clientes: web, SDK y CLI):**
  - Camino feliz: crear → pagar → enviar → confirmar.
  - Liberación automática por plazo vencido.
  - Disputa resuelta por árbitro (liberar y reembolsar).
- *Links a stellar.expert en el README.*

---

## Slide 6: Modelo de Negocio y Viabilidad
**Título:** Cómo monetiza el protocolo Chaski
- **Take Rate Transaccional (1.0% – 1.5%):** Cobrado sobre el monto protegido únicamente al liberarse con éxito (se implementa on-chain en el contrato v2).
  - *Valor para el usuario:* Pagar 1.5% por seguridad es infinitamente mejor que arriesgar el 100% del dinero.
- **Suscripción Vendedor Pro (Bs 49/mes):** Perfil verificado, link personalizado, soporte prioritario en arbitraje y estadísticas.
- **Chaski as a Service / B2B:** API/SDK para marketplaces (ej. Likida) o empresas de encomiendas que quieran ofrecer "Envío Seguro" a sus clientes.

---

## Slide 7: Visión a Futuro — Chaski Protocol
**Título:** Más allá del marketplace: infraestructura de confianza
- **Hoy:** `@chaski/sdk` v0.1 ya funciona: escrow en 3 líneas, con cualquier wallet (Freighter, embebida o backend).
- **Próximo:** publicar el SDK, comisión on-chain, árbitro propio por integrador (ej. Likida o empresas de encomiendas) y webhooks.
- **Visión — el mismo motor para:**
- **Vaquita / pandero:** ahorro grupal con custodia neutral (no conocemos una implementación on-chain pensada para Bolivia).
- **Pagos freelance y por hitos:** Desbloqueo progresivo para desarrolladores, diseñadores o construcción civil.
- **Remesas programables:** Envíos desde el exterior que solo se liberan contra factura o matrícula educativa.

---

## Slide 8: Equipo y Plan de Ejecución
**Título:** Roadmap de lanzamiento
- **Equipo:**
  - [Nombre 1] — Smart Contracts & Blockchain Architecture (Stellar / Soroban)
  - [Nombre 2] — Fullstack Development & UX (Next.js / Cloud)
  - [Nombre 3] — Producto, Operaciones y Validación de Mercado
- **Próximos 60 días:**
  1. Piloto cerrado con 20 comerciantes activos de Facebook Marketplace / WhatsApp en La Paz, Cochabamba y Santa Cruz.
  2. Onboarding sin cripto (wallet embebida, ej. Pollar) y rampa Bs ↔ USDC por QR con un partner local.
  3. Despliegue en Stellar Mainnet con soporte nativo de USDC.
