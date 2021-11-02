import "v8-compile-cache";

import path from "path";
import {app, nativeTheme, BrowserWindow} from "electron";
import log from "electron-log";
import {setupLoggers} from "@app/common/log";
import {setupSingleInstanceLock} from "@app/browser/instance";
import {setupApplicationMenu} from "@app/browser/menu";
import {setupSession} from "@app/browser/session";
import {initializeWindow} from "@app/browser/window";
import {setupAnalytics} from "@app/common/analytics";
import {setupConfig} from "@app/common/config";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../build/");

app.on("ready", () => {
    setupLoggers();
    log.info("Initializing AnimeMusicQuiz Electron.");

    if (!setupSingleInstanceLock()) {
        log.warn("An instance is already running, exiting.")
        app.quit();
        return;
    }

    global.appConfig = setupConfig();
    nativeTheme.themeSource = "dark";

    setupAnalytics();
    setupApplicationMenu();
    setupSession();

    const [window, view] = initializeWindow();
    global.browserWindow = window;
    global.amqBrowserView = view;

    if (!app.isPackaged) {
        // Open dev tools if not in production environment
        view.webContents.openDevTools({mode: "detach"});
    }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        const [window, view] = initializeWindow();
        global.browserWindow = window;
        global.amqBrowserView = view;
    }
});