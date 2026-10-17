param (
    [string]$ContractId = "CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X",
    [string]$TokenId = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CHASKI - Demo del Flujo Escrow P2P en Stellar Testnet   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$seller = (stellar keys address vendedor).Trim()
$buyer = (stellar keys address comprador).Trim()
$arbitro = (stellar keys address arbitro).Trim()

Write-Host "Vendedor:  $seller"
Write-Host "Comprador: $buyer"
Write-Host "Árbitro:   $arbitro"
Write-Host "Contrato:  $ContractId"
Write-Host "Token SAC: $TokenId (XLM Nativo)"
Write-Host ""

# 1. Crear Orden
Write-Host "[1/4] Vendedor crea la orden por 10 XLM..." -ForegroundColor Yellow
$orderId = (stellar contract invoke --id $ContractId --source vendedor --network testnet -- create_order --seller $seller --token $TokenId --amount 100000000 --ship_deadline_secs 3600 --confirm_window_secs 7200).Trim()
Write-Host "✅ Orden #$orderId creada con éxito!" -ForegroundColor Green

# 2. Bloquear Fondos
Write-Host "[2/4] Comprador deposita 10 XLM en el Escrow..." -ForegroundColor Yellow
stellar contract invoke --id $ContractId --source comprador --network testnet -- fund --order_id $orderId --buyer $buyer
Write-Host "✅ Fondos bloqueados en el contrato inteligente!" -ForegroundColor Green

# 3. Marcar Enviado
Write-Host "[3/4] Vendedor envía encomienda y registra hash de guía..." -ForegroundColor Yellow
$hash = "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"
stellar contract invoke --id $ContractId --source vendedor --network testnet -- mark_shipped --order_id $orderId --evidence_hash $hash
Write-Host "✅ Estado cambiado a 'Shipped' con evidencia registrada on-chain!" -ForegroundColor Green

# 4. Confirmar y Liberar
Write-Host "[4/4] Comprador confirma recepción del paquete..." -ForegroundColor Yellow
stellar contract invoke --id $ContractId --source comprador --network testnet -- confirm_received --order_id $orderId
Write-Host "✅ Fondos liberados automáticamente al vendedor!" -ForegroundColor Green

# 5. Consultar Reputación
Write-Host ""
Write-Host "Reputación on-chain del vendedor:" -ForegroundColor Cyan
stellar contract invoke --id $ContractId --source vendedor --network testnet -- get_reputation --addr $seller

Write-Host ""
Write-Host "Ver contrato en Stellar Expert:" -ForegroundColor Magenta
Write-Host "https://stellar.expert/explorer/testnet/contract/$ContractId"
