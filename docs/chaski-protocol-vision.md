# Chaski Protocol — Vision de Producto y Hoja de Ruta

Complementa analisis-pros-contras-mvp.md con la vision del protocolo/SDK.
Contexto: recomendaciones Ideaton Stellar Bolivia 2026.

---

## 1. De app a protocolo

El contrato Soroban de Chaski es generico. No sabe si escolta una chompa,
una remesa o el avance de una obra. Eso es una ventaja.

La oportunidad es convertirlo en un PROTOCOLO DE PAGOS CONDICIONADOS que
terceros integren, igual que P2PKit permite cobrar en moneda local y
liquidar en USDC sin que el merchant sepa nada de blockchain.

Capas del ecosistema:

  [CAPA APLICACION]
  Likida | Vaquita | Marketplaces | Freelancers | Remesas | Startups Bolivia

         |--- Chaski SDK / API (@chaski/sdk)

  [CHASKI PROTOCOL LAYER]
  Contrato Soroban | Modulos: Escrow, Vaquita, Multifirma | SDK TS | API REST

         |--- Red Stellar

  [INFRAESTRUCTURA STELLAR]
  Stellar Network | Soroban | USDC (SAC) | XLM | Anchors
  Pollar (on/off-ramp Bolivianos <-> USDC en Bolivia)

---

## 2. Casos de uso habilitados por el protocolo

### 2.1 Escrow P2P para marketplaces (IMPLEMENTADO HOY)

Comprador + vendedor en distintas ciudades, envio por encomienda.
El contrato bloquea fondos hasta que el paquete llega.

- Integradores target: Likida, vendedores de Facebook Marketplace, WhatsApp
- Moneda: XLM o USDC. Con Pollar: usuario paga Bs, contrato recibe USDC.

### 2.2 Vaquita / Pandero — ahorro grupal on-chain

Problema: Las vaquitas en Bolivia/LATAM usan confianza personal.
Si el organizador desaparece, todos pierden. NO EXISTE EN STELLAR.

Solucion Chaski: tipo de orden N-de-N multifirma. El contrato solo
transfiere al beneficiario del turno cuando todos depositaron su cuota.

  Ejemplo — 4 personas, 50 USDC/mes:
    Turno 1: A recibe 200 USDC cuando B, C, D depositaron.
    Turno 2: B recibe 200 USDC cuando A, C, D depositaron.
  El organizador no puede robar el pozo. El contrato es custodio neutral.

Estado: No implementado en Stellar aun. Oportunidad real de ser primeros.

### 2.3 Pagos freelance por entrega (Trestlework-style)

Problema: cliente en Santa Cruz contrata disenador en Cochabamba.
Quien paga primero? Quien confia en quien?

Solucion: cliente fondea escrow, freelancer entrega, cliente confirma y
se libera el pago. Discrepancia -> arbitro resuelve.

Internacional: con USDC funciona Bolivia-Argentina-Colombia-Espana
sin tocar el sistema bancario.

### 2.4 Remesas con destino especifico

Problema: migrante en Espana envia dinero pero no controla el uso.

Solucion: escrow con condicion. Solo libera cuando el beneficiario
muestra comprobante de colegio/alquiler/farmacia (hash on-chain).
Retira en Bs via Pollar.

### 2.5 Pagos por avance de obra / hitos

Problema: contratista pide 50% adelantado, cliente no quiere pagar
sin ver trabajo. Desconfianza paraliza proyectos.

Solucion: escrow por hitos. Por cada hito aprobado (foto + hash
on-chain) se libera un porcentaje. Disputa -> arbitro.

---

## 3. API del SDK

No hay base de datos propia ni custodia. El estado vive en Stellar.

  chaski.escrow.create({ token, amount, seller, shipDeadlineSecs, confirmWindowSecs })
  chaski.vaquita.create({ token, quotaAmount, participants[], cycleDays })
  chaski.milestones.create({ token, totalAmount, milestones[] })

---

## 4. Modelo de negocio

| Fuente                | Descripcion                                | Estimado       |
|-----------------------|--------------------------------------------|----------------|
| Fee por transaccion   | 1-1.5% del monto protegido al liberarse    | Principal      |
| Plan Vendedor Pro     | Dominio + arbitro premium + historial      | Bs 50-100/mes  |
| White-label SDK       | Startups que integran el SDK               | Por volumen    |
| Arbitro como servicio | Red de arbitros verificados de Chaski      | % del fee      |

Proyeccion: 100 tx/mes x Bs 500 x 1.5% = Bs 750/mes (bootstrap).
Con integracion Likida: escala sin costo marginal.

---

## 5. Partners e integraciones

Pollar (pollar.xyz)
  Rol: on-ramp/off-ramp fiat. Bs (QR bancario) <-> USDC en Stellar.
  Estado MVP: mencionado en el pitch. Sin integracion en codigo aun.

Likida (likidaapp.com)
  Rol: marketplace boliviano con miles de usuarios activos.
  Propuesta: integrar SDK Chaski. Ventaja: elimina riesgo regulatorio
  de captacion de fondos y costo de custodia central.

Trestlework (trestlework.io)
  Rol: empresa de soluciones de pago para LATAM.
  Propuesta: modulo "pago seguro por entrega" dentro de su stack.

---

## 6. Hoja de ruta post-hackathon

Fase 1 (sem 1-4):  Mainnet USDC + piloto 20 vendedores Bolivia
Fase 2 (sem 5-8):  Integracion Pollar (Bs -> USDC -> escrow -> Bs)
Fase 3 (mes 3-4):  @chaski/sdk en npm + primer integrador externo
Fase 4 (mes 5-6):  Vaquita on-chain + Hitos + Arbitro como servicio
Fase 5 (mes 7-12): Expansion LATAM + anchors locales + USDC internacional

---

## 7. Por que Stellar

- Comisiones <.0001 vs Ethereum -50
- Finalidad ~5 seg vs Bitcoin 60 min
- USDC nativo (SAC oficial Circle, no bridged)
- Anchors/fiat: red global de anchors regulados
- Soroban: Rust+WASM, costos predecibles (no gas variable como EVM)
- Foco LATAM: core del ecosistema Stellar

---

Documento: octubre 2026 — Ideaton Stellar Bolivia.
