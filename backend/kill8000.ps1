Write-Host "Matando procesos reales del puerto 8000..."

$items = netstat -ano | Select-String ":8000" | ForEach-Object {
    ($_ -split "\s+")[-1]
} | Select-Object -Unique

foreach ($pid in $items) {
    if ($pid -match '^\d+$') {
        Write-Host "Intentando matar PID $pid..."
        taskkill /PID $pid /F 2>$null
    }
}

Write-Host "Limpieza de tabla TCP..."
netsh winsock reset
