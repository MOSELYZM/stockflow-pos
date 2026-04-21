# StockFlow POS Desktop App - Build Instructions (Electron)

## Prerequisites

### 1. Install Node.js
Download and install from: https://nodejs.org/ (LTS version recommended)

## Build Steps

### Option 1: Manual Build

1. **Open Command Prompt (cmd.exe)** or PowerShell:
   ```
   Press Win+R, type "cmd", press Enter
   ```

2. **Navigate to project folder**:
   ```cmd
   cd e:\inventory-flow-chic-main
   ```

3. **Install dependencies**:
   ```cmd
   npm install
   ```

4. **Build desktop app**:
   ```cmd
   npm run desktop:build
   ```

## Build Output

After successful build, find your installer at:
```
release\
```

**Windows outputs:**
- `.exe` - Windows Installer

## Troubleshooting

### "running scripts is disabled" Error
Use Command Prompt (cmd.exe) instead of PowerShell, or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Running in Development Mode

To test without building:
```cmd
npm run desktop:dev
```

This opens a development window.

## Features of Desktop App

- ✅ Works completely offline
- ✅ Native window (no browser)
- ✅ File system access for exports
- ✅ Auto-updater ready
- ✅ Cross-platform (Windows, macOS, Linux)

## Distribution

Share the `.exe` (Windows) or `.dmg` (macOS) installer from the `release/` folder.
Users can install it like any desktop application.

---

**Need help?** Check the Electron documentation: https://www.electronjs.org/docs
