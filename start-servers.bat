@echo off
echo ========================================
echo  Starting Hybrid Job System
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d c:\cruz && python run.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend React Server...
start "Frontend React Server" cmd /k "cd /d c:\cruz\frontend && npm run dev"

echo.
echo ========================================
echo  Servers Starting!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
echo (Servers will continue running in separate windows)
pause >nul
