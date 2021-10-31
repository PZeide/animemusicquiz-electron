import path from "path";
import {app, dialog, ipcMain, shell, BrowserView, BrowserViewConstructorOptions, BrowserWindow, BrowserWindowConstructorOptions} from "electron";
import log from "electron-log";
import {setupWindowStateListeners} from "@app/common/window-state";

function createWindow(): BrowserWindow {
    const options: BrowserWindowConstructorOptions = {
        icon: path.join(buildPath, "icon.ico"),
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        title: "AnimeMusicQuiz",
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../renderer/preload/root-preload.js")
        }
    };

    return new BrowserWindow(options);
}

function createView(): BrowserView {
    const options: BrowserViewConstructorOptions = {
        webPreferences: {
            preload: path.join(__dirname, "../renderer/preload/amq-preload.js")
        }
    }

    return new BrowserView(options);
}

function configureView(view: BrowserView, window: BrowserWindow) {
    const titleBarHeight = 30;

    // Set bounds of browser view to window bounds minus title bar height
    view.setBounds({
        x: 0,
        y: titleBarHeight,
        width: window.getBounds().width,
        height: window.getBounds().height - titleBarHeight
    });

    view.setAutoResize({
        width: true,
        height: true
    });

    // Adapt browser view position and size when toggling fullscreen since title bar disappear
    window.on("enter-full-screen", () => {
        let bounds = view.getBounds();
        bounds.y = 0;
        bounds.height += titleBarHeight;
        view.setBounds(bounds);
    });

    window.on("leave-full-screen", () => {
        let bounds = view.getBounds();
        bounds.y = 30;
        bounds.height -= titleBarHeight;
        view.setBounds(bounds);
    });

    // Open external links with default browser
    view.webContents.setWindowOpenHandler((handler) => {
        shell.openExternal(handler.url)
            .catch(() => log.warn("Unable to load external url in default browser."));

        return { action: "deny" };
    });
}

function listenRootStateChange(window: BrowserWindow) {
    ipcMain.on("root-ask-minimize", () => {
        window.minimize();
    });

    ipcMain.on("root-ask-maximize", () => {
        window.maximize();
    });

    ipcMain.on("root-ask-unmaximize", () => {
        window.unmaximize();
    });

    ipcMain.on("root-ask-close", () => {
        window.close();
    });
}

export function initializeWindow(): [BrowserWindow, BrowserView] {
    const window = createWindow();
    const view = createView();

    window.setBrowserView(view);
    configureView(view, window);

    // Load content
    window.loadFile(path.join(buildPath, "index.html"))
        .then(() => log.info("Root file successfully loaded."));

    view.webContents.loadURL("https://animemusicquiz.com/?forceLogin=True")
        .then(() => {
            log.info("AnimeMusicQuiz site successfully loaded.");
            window.show();
        }).catch(() => {
            log.error("AnimeMusicQuiz site is unreachable.");
            dialog.showErrorBox("AMQ unavailable", "AnimeMusicQuiz is currently unavailable.\nYou should check your internet connection or try again later.");
            app.quit();
        });

    listenRootStateChange(window);
    setupWindowStateListeners(window, window.webContents, view.webContents);

    return [window, view]
}