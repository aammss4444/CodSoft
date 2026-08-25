Write-Host "Starting MAISIP Servers..." -ForegroundColor Cyan

# Start Node.js Backend
Write-Host "Starting Node.js Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm install; node server.js"

# Start Python FastAPI Microservice
Write-Host "Starting Python AI Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\ml_pipeline; if (Test-Path venv\Scripts\activate.ps1) { .\venv\Scripts\activate.ps1 }; uvicorn api:app --host 0.0.0.0 --port 8000 --reload"

# Start Next.js Frontend
Write-Host "Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "All servers have been launched in separate blue PowerShell windows!" -ForegroundColor Green
Write-Host "Once the Next.js server says 'Ready', open http://localhost:3000 in your browser." -ForegroundColor White
