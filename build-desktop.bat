@echo off
chcp 65001 >nul
echo ==========================================
echo   StockFlow POS - Desktop App Builder
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if Rust is installed
rustc --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Rust is not installed!
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo ✅ Rust found
echo.

REM Install dependencies
echo 📦 Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Generate icons if they don't exist
if not exist "src-tauri\icons\icon.ico" (
    echo 🎨 Generating app icons...
    cd src-tauri
    if exist "generate-icons.ps1" (
        powershell -ExecutionPolicy Bypass -File generate-icons.ps1
    ) else (
        echo ⚠️  Icon generation script not found. Using placeholder.
        mkdir icons 2>nul
        copy "..\src\assets\stockflow-logo.png" "icons\icon.png" >nul 2>&1
    )
    cd ..
) else (
    echo ✅ Icons already exist
)

echo.
echo 🔨 Building desktop app...
echo This may take several minutes for the first build...
echo.

REM Build the desktop app
call npm run desktop:build

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    echo.
    echo Common issues:
    echo 1. Visual Studio Build Tools not installed
    echo    Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo    Select: "Desktop development with C++" workload
    echo.
    echo 2. If you have VS Build Tools but still failing:
    echo    Run: npm config set msvs_version 2022
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Build Successful!
echo ==========================================
echo.
echo Installer location:
echo   src-tauri\target\release\bundle\
echo.
echo Look for:
echo   - MSI installer: *.msi
echo   - NSIS installer: *.exe
echo.
pause
