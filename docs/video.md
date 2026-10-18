# Pitch en Video (3 minutos) — Chaski

> **Hackathon:** Ideatón Stellar Bolivia 2026 · Track 02 Pagos y Remesas
> **Formato:** POV vendedor + POV comprador sobre la web real en Stellar testnet
> **Web:** https://chaski-app-smoky.vercel.app
> **Duración:** 3:00 máx. (~400 palabras de voz en off; leer a ritmo tranquilo)

**Idea central del video:** los dos lados tienen miedo. El comprador teme pagar y que lo bloqueen; el vendedor teme enviar y no cobrar. Mostramos la misma compra desde los dos celulares/pantallas y cómo Chaski elimina ambos miedos.

**Personajes (ficticios, interpretados por el equipo):**
- **Carla — vendedora en La Paz.** Vende chompas de alpaca por Facebook Marketplace y WhatsApp.
- **Diego — comprador en Santa Cruz.** Quiere una chompa pero ya escuchó de estafas.

| Tramo | Tiempo | Contenido |
|---|---|---|
| 1 | 0:00 – 0:20 | Gancho: la estafa real (Luna) |
| 2 | 0:20 – 0:40 | El doble miedo + validación |
| 3 | 0:40 – 2:05 | Demo POV vendedor ↔ comprador |
| 4 | 2:05 – 2:25 | ¿Y si algo sale mal? + por qué Stellar |
| 5 | 2:25 – 3:00 | Modelo de negocio, SDK y cierre |

---

## 1 · Gancho (0:00 – 0:20)

**Visual:** pantalla negra → simulación de chat de WhatsApp: *"Pasame la mitad por adelantado y te envío hoy mismo"* → comprobante de transferencia → *"Este contacto te ha bloqueado"*. Luego la cita en grande.

**Voz:**
> "«Estaba comprando algo para mi casa. Me pidieron la mitad por adelantado, les pagué… y me bloquearon». Esto le pasó a Luna, una de las personas que entrevistamos. En Bolivia, comprarle a alguien de otra ciudad por redes es un acto de fe."

---

## 2 · El doble miedo + validación (0:20 – 0:40)

**Visual:** pantalla dividida.
- **Izquierda — POV VENDEDOR (Carla, La Paz):** *"¿Y si envío la chompa y no me paga?"*
- **Derecha — POV COMPRADOR (Diego, Santa Cruz):** *"¿Y si pago y me bloquea?"*

Después, 3 números grandes en pantalla: **4 de 6** · **6 de 6** · **4 de 6**.

**Voz:**
> "El problema tiene dos lados: el comprador no quiere pagar primero y el vendedor no quiere enviar primero. Entrevistamos a seis compradores y vendedores: cuatro ya fueron estafados o dejaron de comprar por miedo, los seis usarían un sistema que congele el dinero hasta que llegue el paquete, y cuatro de seis dicen que el vendedor pagaría la comisión para demostrar que es legítimo. Por eso creamos Chaski."

---

## 3 · Demo POV vendedor ↔ comprador (0:40 – 2:05)

**Formato visual:** cada toma lleva una etiqueta fija arriba a la izquierda:
`🟠 POV VENDEDOR · Carla · La Paz` o `🔵 POV COMPRADOR · Diego · Santa Cruz`.
Grabar cada pantalla por separado y cortar la espera de la red (dejar solo el momento de "firmar" y el resultado).

### 3.1 🟠 Vendedor crea el link (0:40 – 0:58)
**Acción:** `/vender` → Producto: *"Chompa de alpaca talla M"* · Precio: *10 XLM* · Origen: *La Paz* · Destino: *Santa Cruz* · modo demo activado → **"Crear Link de Pago Protegido"** → firmar en Freighter → aparece el link → **"Compartir por WhatsApp"**.

**Voz:**
> "Carla crea su orden en segundos: producto, precio y destino. Firma con su billetera y obtiene un link de pago que comparte por WhatsApp, como siempre lo hizo."

### 3.2 🔵 Comprador paga y el dinero queda bloqueado (0:58 – 1:18)
**Acción:** Diego abre el link en su pantalla → ve producto, ciudades y la **reputación on-chain de Carla** → **"Pagar 10 XLM y Asegurar Fondos"** → firma → estado cambia a **Pagado / en custodia**.

**Voz:**
> "Diego abre el link y ve la reputación de Carla registrada en la blockchain, que nadie puede falsificar. Paga, pero el dinero no va a Carla: queda bloqueado en un contrato inteligente de Stellar. Ni Carla puede tocarlo antes de enviar, ni Diego puede retirarlo a escondidas."

### 3.3 🟠 Vendedor ve el pago asegurado y envía (1:18 – 1:40)
**Acción:** en la pantalla de Carla la orden se actualiza sola a "pagado". Corte a una toma real (o simulada) entregando el paquete en la terminal de buses → Empresa: *Trans Copacabana* · Guía: *TC-98421* · sube la foto del comprobante → **"Confirmar Envío y Registrar Evidencia On-Chain"** → firma.

**Voz:**
> "Ahora Carla sí puede enviar tranquila: ve que el pago está asegurado. Despacha la encomienda en la terminal, sube el número de guía y la foto del comprobante. Chaski guarda la huella digital de esa evidencia en la blockchain, así nadie puede cambiarla después."

### 3.4 🔵 Comprador recibe y confirma (1:40 – 2:05)
**Acción:** Diego recibe el paquete (toma abriendo la caja) → en su pantalla ve la foto, la guía y el sello **"Evidencia verificada"** → **"Confirmar Recepción y Liberar Pago"** → firma → estado **Completado**. Corte a la pantalla de Carla: Completado + saldo recibido. Abrir el link de **stellar.expert** con la transacción.

**Voz:**
> "El paquete llega a Santa Cruz. Diego revisa que todo esté bien y confirma con un clic. En unos segundos el dinero llega a Carla. Cada paso es una transacción real en Stellar que cualquiera puede verificar."

---

## 4 · ¿Y si algo sale mal? + por qué Stellar (2:05 – 2:25)

**Visual:** tres tarjetas rápidas (2–3 s cada una), con capturas de órdenes ya preparadas:
1. 🔵 *"Carla no envía"* → el comprador recupera su dinero al vencer el plazo.
2. 🟠 *"Diego no confirma"* → el vendedor cobra automáticamente al vencer el plazo.
3. ⚖️ *"Paquete dañado"* → disputa con foto y motivo → panel `/arbitro` → el árbitro decide devolver o liberar.

**Voz:**
> "¿Y si algo sale mal? Si el vendedor no envía, el comprador recupera su dinero. Si el comprador no confirma, el vendedor cobra solo. Y si hay un problema, un árbitro revisa la evidencia y decide. Todo esto corre en Stellar: comisiones de fracciones de centavo y confirmación en segundos, lo que hace viable proteger compras pequeñas."

---

## 5 · Modelo, SDK y cierre (2:25 – 3:00)

**Visual:** comisión **1–1,5 %** vs **perder el 50–100 %** en una estafa → snippet de `@chaski/sdk` (README, sección 5) y la terminal con `npx tsx scripts/sdk-demo.ts` mostrando los links → pantalla final con logo, URL y equipo: **Victor Hugo Murillo Siles** (Full Stack) y **Ronald Augusto Rodríguez Serrano** (Frontend y Comunicación).

**Voz:**
> "Cobramos entre 1 y 1,5 % del monto protegido solo cuando la compra se completa: mucho menos que perder la mitad en una estafa. Y Chaski no es solo esta web: es un SDK que cualquier marketplace o empresa de encomiendas puede integrar en pocas líneas. Lo siguiente: login sin cripto desde el celular y pago en bolivianos con un partner local. Chaski: el mensajero que lleva la confianza de una ciudad a otra."

---

## Preparación de la grabación (hacer ANTES)

**Dos perfiles de navegador, uno por personaje:**
- [ ] **Perfil Chrome "Carla"** con Freighter → cuenta `vendedor` importada (GDOFC…C27G), red **Testnet**.
- [ ] **Perfil Chrome "Diego"** con Freighter → cuenta `comprador` importada (GALDE…VNJV), red **Testnet**.
- [ ] Ambas cuentas con saldo de XLM de testnet (Friendbot si hace falta).
- [ ] Ventanas al mismo tamaño, zoom 110–125 % para que se lea; ocultar marcadores y pestañas personales.

**Órdenes preparadas para el tramo 4** (crearlas 10–15 min antes, en modo demo = plazos de 3 min):
- [ ] Una orden **pagada y no enviada** con el plazo vencido (botón de reembolso visible para el comprador).
- [ ] Una orden **enviada y no confirmada** con el plazo vencido (botón de cobrar visible para el vendedor).
- [ ] Una orden **en disputa** con foto y motivo, para mostrar `/arbitro` con la billetera `arbitro`.

**Tomas reales opcionales (suman mucho):**
- [ ] Celular mostrando el link llegando por WhatsApp.
- [ ] Entregar un paquete (o simularlo) y una foto del comprobante de encomienda.
- [ ] Abrir la caja en el lado del comprador.

**Si algo falla en cámara:**
- Si aparece un error de red, refrescar la página: el estado real está en la blockchain. Volver a grabar solo esa toma.
- Grabar todo el tramo 3 en tomas separadas y armarlo en edición; no hace falta hacerlo de corrido.
- Respaldo: los links de stellar.expert de las órdenes #4 y #5 en el README.

**Edición:**
- Etiqueta POV fija en cada toma (🟠 vendedor / 🔵 comprador).
- Subtítulos con la voz en off (muchos ven sin sonido).
- Música suave; bajarla durante la demo.
- Cerrar con URL de la web + repo + nombres del equipo.
