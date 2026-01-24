Write-Host "=== Starting Raíz Backend ==="

# 1. Clean port 8000
.\kill8000.ps1

# 2. Start Uvicorn with optimized settings for Windows
# - Uses python -m uvicorn to avoid wrapper issues
# - Uses --reload-delay 1 to prevent rapid restart loops
# - Uses --reload-exclude to ignore cache files
# - Uses --no-access-log to reduce I/O and potential locks
Write-Host "Starting Uvicorn..."
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload --reload-delay 1 --reload-exclude "*__pycache__*" --no-access-log
