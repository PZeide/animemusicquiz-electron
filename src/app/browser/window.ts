import * as path from "path";
import {
  app,
  dialog,
  ipcMain,
  shell,
  BrowserView,
  BrowserViewConstructorOptions,
  BrowserWindow,
  BrowserWindowConstructorOptions,
} from "electron";
import log from "electron-log";
import { publicPath } from "@app/common/utils";
import { config } from "@app/common/config";

const customTitleBar = process.platform === "win32" && config.appearance.customTitleBar;

function createWindow(): BrowserWindow {
  const options: BrowserWindowConstructorOptions = {
    icon: "../../../build/icon.ico",
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    title: "AnimeMusicQuiz",
    frame: !customTitleBar,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../renderer/title-bar-preload.js"),
    },
  };

  return new BrowserWindow(options);
}

function createView(): BrowserView {
  const options: BrowserViewConstructorOptions = {
    webPreferences: {
      preload: path.join(__dirname, "../renderer/amq-preload.js"),
    },
  };

  return new BrowserView(options);
}

function configureWindow(window: BrowserWindow, view: BrowserView) {
  window.setBrowserView(view);
  window.setMenuBarVisibility(false);

  if (customTitleBar) {
    window
      .loadFile(path.join(publicPath, "title-bar/index.html"))
      .then(() => log.info("Title bar successfully loaded."))
      .catch((err) => log.warn("Failed to load title bar.", err));
  }

  listenTitleBarButtons(window);
}

function configureView(view: BrowserView, window: BrowserWindow) {
  const titleBarHeight = 30;

  // Set bounds of browser view to window bounds minus title bar height
  view.setBounds({
    x: 0,
    y: customTitleBar ? titleBarHeight : 0,
    width: window.getBounds().width,
    height: customTitleBar ? window.getBounds().height - titleBarHeight : window.getBounds().height,
  });

  view.setAutoResize({
    width: true,
    height: true,
  });

  if (customTitleBar) {
    // Adapt browser view position and size when toggling fullscreen because title bar disappears
    window.on("enter-full-screen", () => {
      const bounds = view.getBounds();
      bounds.y = 0;
      bounds.height += titleBarHeight;
      view.setBounds(bounds);
    });

    window.on("leave-full-screen", () => {
      const bounds = view.getBounds();
      bounds.y = 30;
      bounds.height -= titleBarHeight;
      view.setBounds(bounds);
    });
  }

  // Open external links with default browser
  view.webContents.setWindowOpenHandler((handler) => {
    shell
      .openExternal(handler.url)
      .catch((err) => log.warn("Unable to load external url in default browser.", err));

    return { action: "deny" };
  });
}

function listenTitleBarButtons(window: BrowserWindow) {
  ipcMain.on("title-bar-minimize", () => {
    window.minimize();
  });

  ipcMain.on("title-bar-maximize", () => {
    window.maximize();
  });

  ipcMain.on("title-bar-unmaximize", () => {
    window.unmaximize();
  });

  ipcMain.on("title-bar-close", () => {
    window.close();
  });
}

function setupWindowStateListeners(window: BrowserWindow, view: BrowserView) {
  window.on("maximize", () => {
    window.webContents.send("window-maximize");
    view.webContents.send("window-maximize");
  });

  window.on("unmaximize", () => {
    window.webContents.send("window-unmaximize");
    view.webContents.send("window-unmaximize");
  });

  window.on("enter-full-screen", () => {
    window.webContents.send("window-enter-full-screen");
    view.webContents.send("window-enter-full-screen");
  });

  window.on("leave-full-screen", () => {
    window.webContents.send("window-enter-leave-screen");
    view.webContents.send("window-enter-leave-screen");
  });
}

export function initializeWindow(): BrowserWindow {
  const window = createWindow();
  const view = createView();

  configureWindow(window, view);
  configureView(view, window);

  setupWindowStateListeners(window, view);

  view.webContents
    .loadURL("https://animemusicquiz.com/?forceLogin=True")
    .then(() => {
      log.info("AnimeMusicQuiz site successfully loaded.");
      window.show();
    })
    .catch((err) => {
      log.error("AnimeMusicQuiz site is unreachable.", err);
      dialog.showErrorBox(
        "AMQ unavailable",
        "AnimeMusicQuiz is currently unavailable.\nYou should check your internet connection or try again later."
      );
      app.quit();
    });

  return window;
}
