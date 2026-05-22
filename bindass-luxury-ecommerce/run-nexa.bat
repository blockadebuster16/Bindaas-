@echo off
setlocal
title NEXA Intelligence Platform - Starter

echo ======================================================
echo   NEXA Intelligence Platform: Unified Boot Sequence
echo ======================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+ and add to PATH.
    pause
    exit /b 1
)

:: Check for Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js and add to PATH.
    pause
    exit /b 1
)

echo [1/3] Starting NEXA AI Core (FastAPI on Port 8000)...
start "NEXA AI Core" cmd /c "cd ai-server && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting E-Commerce Backend (Node.js on Port 5001)...
start "NEXA Backend" cmd /c "cd server && npm run dev"

echo [3/3] Starting Storefront Frontend (React on Port 3000)...
start "NEXA Storefront" cmd /c "cd client && npm start"

echo.
echo ======================================================
echo   ALL SYSTEMS INITIATED
echo ======================================================
echo.
echo   - AI API: http://localhost:8000
echo   - Backend: http://localhost:5001
echo   - Storefront: http://localhost:3000
echo.
echo   You can now close this window. Individual servers 
echo   are running in separate command windows.
echo ======================================================
pause
