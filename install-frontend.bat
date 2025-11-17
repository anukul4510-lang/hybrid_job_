@echo off
echo ========================================
echo  Installing React Frontend Dependencies
echo ========================================
echo.

cd frontend

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Recommended: LTS version
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

echo Checking if npm is installed...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm found!
npm --version
echo.

echo Installing dependencies... (This may take a few minutes)
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Installation Complete! ✓
echo ========================================
echo.
echo To start the development server, run:
echo    cd frontend
echo    npm run dev
echo.
echo The frontend will be available at: http://localhost:5173
echo.
echo Don't forget to start the backend server:
echo    python run.py
echo.
pause
