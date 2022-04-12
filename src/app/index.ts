import "v8-compile-cache";

import { app, nativeTheme, BrowserWindow } from "electron";
import log from "electron-log";
import { setupLoggers } from "@app/common/loggers";
import { setupAnalytics } from "@app/browser/analytics";
import { setupApplicationMenu } from "@app/browser/menu";
import { setupSession } from "@app/browser/session";
import { initializeWindow } from "@app/browser/window";
import { setupBrowserIpc } from "@app/browser/ipc";

let browserWindow: BrowserWindow;

setupLoggers();
setupAnalytics();

void app.whenReady().then(() => {
  log.info("Initializing AnimeMusicQuiz Electron.");

  if (!app.requestSingleInstanceLock()) {
    log.warn("An instance is already running, quitting.");
    app.quit();
  }

  nativeTheme.themeSource = "dark";

  setupBrowserIpc();
  setupSession();

  browserWindow = initializeWindow();
  setupApplicationMenu(browserWindow);

  if (!app.isPackaged) {
    // Open dev tools if not in production environment
    browserWindow.getBrowserView()?.webContents.openDevTools({ mode: "detach" });
  }
});

app.on("second-instance", () => {
  log.info("A second instance has tried to be run, forcing app to foreground.");

  if (!browserWindow) return;

  if (browserWindow.isMinimized()) browserWindow.restore();
  browserWindow.focus();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    browserWindow = initializeWindow();
  }
});
