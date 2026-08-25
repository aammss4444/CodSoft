@echo off
echo Starting all MAISIP Servers...

echo Starting Node.js Backend (Port 5000)...
start "Node.js Backend" cmd /c "cd /d %~dp0backend && npm install && node server.js || pause"

echo Starting Python AI Microservice (Port 8000)...
start "Python FastAPI" cmd /c "cd /d %~dp0backend\ml_pipeline && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && uvicorn api:app --host 0.0.0.0 --port 8000 --reload || pause"

echo Starting Next.js Frontend (Port 3000)...
start "Next.js Frontend" cmd /c "cd /d %~dp0frontend && npm install && npm run dev || pause"

echo All servers have been launched in separate windows!
echo Once the Next.js server says "Ready", open http://localhost:3000 in your browser.
pause
