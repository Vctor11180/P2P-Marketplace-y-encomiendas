#!/usr/bin/env bash
set -e

CONTRACT_ID="${1:-CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X}"
TOKEN_ID="${2:-CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC}"

echo "=========================================================="
echo "   CHASKI - Demo del Flujo Escrow P2P en Stellar Testnet   "
echo "=========================================================="

SELLER=$(stellar keys address vendedor | tr -d '\r')
BUYER=$(stellar keys address comprador | tr -d '\r')
ARBITRO=$(stellar keys address arbitro | tr -d '\r')

echo "Vendedor:  $SELLER"
echo "Comprador: $BUYER"
echo "Árbitro:   $ARBITRO"
echo "Contrato:  $CONTRACT_ID"
echo "Token SAC: $TOKEN_ID"
echo ""

# 1. Crear Orden
echo "[1/4] Vendedor crea la orden por 10 XLM..."
ORDER_ID=$(stellar contract invoke --id "$CONTRACT_ID" --source vendedor --network testnet -- create_order --seller "$SELLER" --token "$TOKEN_ID" --amount 100000000 --ship_deadline_secs 3600 --confirm_window_secs 7200 | tr -d '\r')
echo "✅ Orden #$ORDER_ID creada con éxito!"

# 2. Bloquear Fondos
echo "[2/4] Comprador deposita 10 XLM en el Escrow..."
stellar contract invoke --id "$CONTRACT_ID" --source comprador --network testnet -- fund --order_id "$ORDER_ID" --buyer "$BUYER"
echo "✅ Fondos bloqueados en el contrato inteligente!"

# 3. Marcar Enviado
echo "[3/4] Vendedor envía encomienda y registra hash de guía..."
HASH="0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"
stellar contract invoke --id "$CONTRACT_ID" --source vendedor --network testnet -- mark_shipped --order_id "$ORDER_ID" --evidence_hash "$HASH"
echo "✅ Estado cambiado a 'Shipped' con evidencia registrada on-chain!"

# 4. Confirmar y Liberar
echo "[4/4] Comprador confirma recepción del paquete..."
stellar contract invoke --id "$CONTRACT_ID" --source comprador --network testnet -- confirm_received --order_id "$ORDER_ID"
echo "✅ Fondos liberados automáticamente al vendedor!"

# 5. Consultar Reputación
echo ""
echo "Reputación on-chain del vendedor:"
stellar contract invoke --id "$CONTRACT_ID" --source vendedor --network testnet -- get_reputation --addr "$SELLER"

echo ""
echo "Ver contrato en Stellar Expert:"
echo "https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
