#!/usr/bin/env bash
set -e

echo "Construyendo contrato WASM..."
cd contracts/escrow
stellar contract build

echo "Desplegando en testnet..."
CONTRACT_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/escrow.wasm --source vendedor --network testnet --alias escrow | tr -d '\r')
echo "Contrato desplegado con ID: $CONTRACT_ID"

echo "Inicializando contrato..."
SELLER=$(stellar keys address vendedor | tr -d '\r')
ARBITRO=$(stellar keys address arbitro | tr -d '\r')
stellar contract invoke --id "$CONTRACT_ID" --source vendedor --network testnet -- init --admin "$SELLER" --arbiter "$ARBITRO"

cd ../..
echo "Generando bindings TypeScript en packages/escrow-client..."
stellar contract bindings typescript --network testnet --id "$CONTRACT_ID" --output-dir packages/escrow-client --overwrite

echo "✅ Deploy e inicialización completados!"
