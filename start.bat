@echo off
title AlumniConnect Server
cd /d "%~dp0"

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed.
    echo Download from https://nodejs.org and restart this script.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo npm install failed.
        pause
        exit /b 1
    )
)

echo.
echo AlumniConnect running at http://localhost:3000
echo Demo: student@demo.com / demo1234
echo Press Ctrl+C to stop.
echo.
node server/index.js
pause
