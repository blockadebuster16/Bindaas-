@echo off
:: Identify the project root relative to this script
set PROJECT_DIR=%~dp0bindass-luxury-ecommerce

echo [1/3] Starting Main E-commerce Backend (Node.js)...
:: This starts the primary API for orders, products, and users
start cmd /k "cd %PROJECT_DIR%\server && npm start"

echo [2/3] Starting NEXA AI Intelligence Core (FastAPI)...
:: Changed 'main:uvicorn' to 'main:app' to match the FastAPI instance name
:: Uses 'python -m uvicorn' to ensure it uses the environment's python
start cmd /k "cd %PROJECT_DIR%\ai-server && python -m uvicorn main:app --port 8000 --reload"

echo [3/3] "Starting Admin & Storefront (React)..."
start cmd /k "cd %PROJECT_DIR%\client && npm start"

echo.
echo ======================================================
echo "NEXA Intelligence System & E-commerce Suite Initialized"
echo ======================================================
echo AI Engine:    http://localhost:8000
echo Dashboard:    http://localhost:3000
echo API Server:   (Port defined in server/.env)
echo ======================================================
