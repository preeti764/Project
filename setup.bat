@echo off
REM Quick Start Script for Alumni Portal (Windows)

echo ================================
echo Alumni Portal - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js is not installed. Please install Node.js 16+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%
echo.

REM Backend Setup
echo [*] Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please update backend\.env with your MongoDB URI and JWT_SECRET
)

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo [X] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [OK] Backend setup complete
echo.

REM Frontend Setup
echo [*] Setting up Frontend...
cd ..\frontend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [OK] Frontend .env created with default settings
)

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo [X] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [OK] Frontend setup complete
echo.

REM Summary
echo ================================
echo [OK] Setup Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Update backend\.env with your MongoDB URI and JWT_SECRET
echo 2. Run backend (in PowerShell/CMD):
echo    cd backend ^& npm run dev
echo.
echo 3. Run frontend (in new terminal):
echo    cd frontend ^& npm run dev
echo.
echo 4. Open http://localhost:5173
echo.
echo For help, see:
echo - Setup Guide: SETUP_GUIDE.md
echo - API Docs: API_DOCUMENTATION.md
echo - Deployment: DEPLOYMENT.md
echo.
pause
