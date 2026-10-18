# Guion del Video Demo (3 Minutos) — Chaski

> **Hackathon:** Ideatón Stellar Bolivia 2026  
> **Duración máxima:** 3:00 minutos  
> **Estructura:** Problema (0:30) → Validación (0:30) → Demo en vivo (1:00) → Tecnología y Modelo (0:30) → Visión y Cierre (0:30)

---

## Minuto 0:00 – 0:30 | El Problema y la Historia Real
- **Visual:** Pantalla con la cita de Luna Gallego en grande y capturas de chats de Marketplace con el clásico *"te pago la mitad y la otra mitad al enviar"*.
- **Voz en off / Presentador:**
  > *"«Estaba comprando algo para mi casa por Facebook... me dijeron que les pagara la mitad de anticipo, les transferí y me bloquearon al instante». Esta historia no es inventada; nos la contó Luna Gallego, una compradora habitual en la Ideatón Stellar 2026. En Bolivia, comprarle a alguien de otra ciudad por redes sociales es un acto de fe ciega. Si pagas por adelantado te arriesgas a que te bloqueen, y si eres vendedor y envías primero, te arriesgas a que nunca te paguen. Esta desconfianza hace que muchas ventas entre ciudades nunca se concreten."*

---

## Minuto 0:30 – 1:00 | La Validación en el Terreno
- **Visual:** Gráfico con datos de las 6 entrevistas estructuradas en la Ideatón Stellar 2026 (`docs/entrevistas.md`) y citas de los participantes en pantalla.
- **Voz en off:**
  > *"Salimos a entrevistar a personas reales en la Ideatón. Los seis sienten desconfianza al transferir a desconocidos, y cuatro de seis ya fueron estafados o dejaron de comprar por miedo. Los seis usarían un sistema donde el dinero quede congelado de forma neutral hasta que el paquete llegue, y aceptan pagar una comisión de 1 a 2%. Cuatro de seis creen que la debe pagar el vendedor, como señal de que su negocio es legítimo. Para resolver esto creamos Chaski."*

---

## Minuto 1:00 – 2:00 | La Demostración en Vivo (Testnet)
- **Visual:** Grabación de pantalla de la web publicada en Vercel (testnet), conectada a Freighter. Preparar antes una orden ya pagada y otra con el plazo casi vencido para no esperar en cámara.
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
  > *"Elegimos Stellar y Soroban porque sus comisiones son de fracciones de centavo de dólar y su finalidad es de 5 segundos, haciendo posible proteger transacciones desde montos pequeños. El contrato ya acepta USDC, así que el dinero no pierde valor mientras está bloqueado. El siguiente paso es que el usuario no vea cripto: wallets embebidas con login desde el celular, como las que ofrece Pollar en Stellar, y pago con QR en bolivianos a través de un partner local. Monetizamos con una comisión de entre el 1% y 1.5% del valor protegido al completarse la transacción."*

---

## Minuto 2:30 – 3:00 | Protocolo, Visión y Cierre
- **Visual:** El snippet de 3 líneas de `@chaski/sdk` (README, sección 5) y la terminal corriendo `npx tsx scripts/sdk-demo.ts` con los 4 links de stellar.expert. Después, el diagrama con los casos de uso (vaquita grupal, pagos freelance, remesas) y la pantalla de cierre con el equipo.
- **Voz en off:**
  > *"Chaski no es solo una página web. Nuestra web es apenas un integrador más de @chaski/sdk: con tres líneas de código, cualquier marketplace, empresa de encomiendas o backend puede custodiar pagos en el mismo contrato, con la wallet que prefiera. Lo que sigue es publicarlo, sumar la comisión on-chain y llevar el mismo motor a ahorros grupales, remesas con destino y pagos por avance de obra. Chaski devuelve la confianza al comercio boliviano. Muchas gracias."*
