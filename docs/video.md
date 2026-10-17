# Guion del Video Demo (3 Minutos) — Chaski

> **Hackathon:** Ideatón Stellar Bolivia 2026  
> **Duración máxima:** 3:00 minutos  
> **Estructura:** Problema (0:30) → Validación (0:30) → Demo en vivo (1:00) → Tecnología y Modelo (0:30) → Visión y Cierre (0:30)

---

## Minuto 0:00 – 0:30 | El Problema y la Historia Real
- **Visual:** Pantalla con la cita de Luna Gallego en grande y capturas de chats de Marketplace con el clásico *"te pago la mitad y la otra mitad al enviar"*.
- **Voz en off / Presentador:**
  > *"«Estaba comprando algo para mi casa por Facebook... me dijeron que les pagara la mitad de anticipo, les transferí y me bloquearon al instante». Esta historia no es inventada; nos la contó Luna Gallego, una compradora habitual en la Ideatón Stellar 2026. En Bolivia, comprarle a alguien de otra ciudad por redes sociales es un acto de fe ciega. Si pagas por adelantado te arriesgas a que te bloqueen, y si eres vendedor y envías primero, te arriesgas a que nunca te paguen. Esta desconfianza paraliza millones de bolivianos en ventas cada mes."*

---

## Minuto 0:30 – 1:00 | La Validación en el Terreno
- **Visual:** Gráfico con datos de las 6 entrevistas estructuradas en la Ideatón Stellar 2026 (`docs/entrevistas.md`) y citas de los participantes en pantalla.
- **Voz en off:**
  > *"Salimos a entrevistar a personas reales en la Ideatón. Los números fueron contundentes: el 100% de los entrevistados frena sus compras, cancela tratos o vive con miedo constante al transferir a desconocidos. Pero el dato más potente fue la solución: el 100% confirmó que usaría un sistema donde el dinero quede congelado de forma neutral hasta que el paquete llegue a sus manos, y el 80% afirmó que el vendedor con gusto pagaría una pequeña comisión del 1% para certificar que su negocio es legítimo y seguro. Para resolver esto creamos Chaski."*

---

## Minuto 1:00 – 2:00 | La Demostración en Vivo (Testnet)
- **Visual:** Grabación de pantalla de la aplicación web `localhost:3000` / testnet conectada a Freighter.
- **Acciones y Narración:**
  1. **1:00 – 1:15 (Crear Orden):**
     - *Acción:* Entrar a `/vender`. El vendedor ingresa producto ("Chompa de alpaca a Oruro"), monto (3 XLM / USDC), plazo de envío y dirección del comprador. Clic en "Crear Orden".
     - *Voz:* *"El vendedor genera un link de pago protegido por un contrato inteligente en Soroban."*
  2. **1:15 – 1:30 (Pago y Custodia):**
     - *Acción:* El comprador entra al link `/orden/[id]`, conecta Freighter y hace clic en "Pagar". Se firma la transacción. El estado pasa a `Funded`.
     - *Voz:* *"El comprador fondea la orden. Los fondos quedan bloqueados de forma segura e inmutable en Stellar Testnet. Ni el vendedor puede retirarlos antes, ni el comprador cancelarlos unilateralmente."*
  3. **1:30 – 1:45 (Envío y Prueba Criptográfica):**
     - *Acción:* El vendedor ingresa la empresa de encomiendas, número de guía y sube la foto del comprobante.
     - *Voz:* *"El vendedor despacha en la terminal y sube el recibo. El sistema calcula un hash SHA-256 de la evidencia y lo ancla on-chain. La web verifica automáticamente la coincidencia exacta."*
  4. **1:45 – 2:00 (Confirmación y Explorador):**
     - *Acción:* El comprador recibe el paquete, hace clic en "Confirmar Recepción". El estado pasa a `Completed`. Se abre el enlace de `stellar.expert` mostrando la transacción confirmada en 4 segundos.
     - *Voz:* *"El comprador recibe su encomienda, confirma con un clic y el contrato libera los fondos al instante. Sin intermediarios bancarios, con liquidación en segundos."*

---

## Minuto 2:00 – 2:30 | Por qué Stellar y Modelo de Negocio
- **Visual:** Slide comparativa (Costos tradicionales vs Stellar + arquitectura técnica Soroban).
- **Voz en off:**
  > *"Elegimos Stellar y Soroban porque sus comisiones son de fracciones de centavo de dólar y su finalidad es de 5 segundos, haciendo posible proteger transacciones desde montos pequeños. Además, con la integración de USDC y partners de rampa fiat como Pollar, los usuarios pueden fondear con QR bancario en bolivianos sin lidiar con la complejidad de las criptomonedas. Monetizamos con una comisión de entre el 1% y 1.5% del valor protegido al completarse la transacción."*

---

## Minuto 2:30 – 3:00 | Protocolo, Visión y Cierre
- **Visual:** Diagrama de Chaski Protocol (`@chaski/sdk`) con casos de uso (Vaquita grupal, pagos freelance, remesas) y pantalla de cierre con el equipo.
- **Voz en off:**
  > *"Chaski no es solo una página web; es un protocolo de pagos condicionados y custodia descentralizada. Nuestro SDK permitirá a cualquier marketplace o startup boliviana incorporar compras seguras, ahorros grupales o pagos por avance de obra con un par de líneas de código. Chaski devuelve la confianza al comercio boliviano. Muchas gracias."*
