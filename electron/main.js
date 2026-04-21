import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
    title: "StockFlow POS",
    show: false,
  });

  // Check if we are in dev mode
  const isDev = process.env.NODE_ENV !== "production";
  const configuredDevUrl = process.env.ELECTRON_RENDERER_URL;
  const preferredPort = Number(process.env.VITE_PORT) || 5173;

  if (isDev) {
    const candidates = [
      configuredDevUrl,
      `http://localhost:${preferredPort}`,
      `http://127.0.0.1:${preferredPort}`,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean);

    let loaded = false;
    for (const url of candidates) {
      try {
        await mainWindow.loadURL(url);
        loaded = true;
        break;
      } catch {
        // try next candidate
      }
    }

    if (!loaded) {
      await mainWindow.loadURL(
        `data:text/plain,StockFlow POS could not connect to the dev server. Start Vite (e.g. npm.cmd run dev or dev:port) then relaunch.`
      );
    }
  } else {
    // In production, server.js statically serves the dist folder on 3001
    mainWindow.loadURL("http://127.0.0.1:3001");
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });
}

function startServer() {
  // Start the proxy server child process
  const serverPath = path.join(__dirname, "../server.js");
  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    env: { ...process.env, PORT: 3001 },
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
