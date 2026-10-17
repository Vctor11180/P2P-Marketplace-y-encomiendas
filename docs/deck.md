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
- **6 de 6 (100%)** reportan temor constante, compras frenadas o cancelaciones directas por desconfianza en transferencias bancarias a desconocidos.
- **100% de aceptación del Escrow:** Todos los entrevistados usarían un sistema que congele el dinero de forma neutral hasta que el paquete llegue a destino.
- **100% dispuestos a pagar comisión (1%–2%):** Pagar 1.5% de seguridad es insignificante frente a perder el 50% o 100% en una estafa.
- **80% sostiene que el Vendedor debe asumir el fee:** El vendedor financia la garantía como su principal ventaja competitiva para cerrar ventas. (20% propone división 50/50).
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
- **Moneda estable (USDC) y puente fiat (Pollar):** Protección contra devaluación con USDC, integrando on/off-ramp para pagar en Bolivianos con QR bancario y recibir en cuenta local.

---

## Slide 5: Producto y Demostración en Testnet
**Título:** MVP funcional y comprobable en Stellar Testnet
- **Smart Contract desplegado:** `CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X`
- **Web App moderna:** Conexión nativa con Freighter Wallet, roles dinámicos (vendedor, comprador, árbitro) y metadata off-chain en Neon.
- **Verificación de evidencia:** Comparación en vivo entre SHA-256 off-chain y hash on-chain.
- **Transacciones reales ejecutadas:**
  - Creación y fondeo de orden.
  - Liberación tras confirmación de encomienda.
  - Resolución de disputa con reembolso por árbitro.
- *Links directos a stellar.expert para máxima transparencia.*

---

## Slide 6: Modelo de Negocio y Viabilidad
**Título:** Cómo monetiza el protocolo Chaski
- **Take Rate Transaccional (1.0% – 1.5%):** Cobrado sobre el monto protegido únicamente al liberarse con éxito.
  - *Valor para el usuario:* Pagar 1.5% por seguridad es infinitamente mejor que arriesgar el 100% del dinero.
- **Suscripción Vendedor Pro (Bs 49/mes):** Perfil verificado, link personalizado, soporte prioritario en arbitraje y estadísticas.
- **Chaski as a Service / B2B:** API/SDK para marketplaces (ej. Likida) o empresas de encomiendas que quieran ofrecer "Envío Seguro" a sus clientes.

---

## Slide 7: Visión a Futuro — Chaski Protocol
**Título:** Más allá del marketplace: infraestructura de confianza
- **SDK abierto (@chaski/sdk):** Cualquier startup en LATAM puede integrar escrow con 3 líneas de código.
- **Vaquita On-Chain:** Ahorro grupal descentralizado con custodia multipartita en Stellar.
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
  2. Integración de rampa fiat (QR Simple en Bs a través de Pollar).
  3. Despliegue en Stellar Mainnet con soporte nativo de USDC.
