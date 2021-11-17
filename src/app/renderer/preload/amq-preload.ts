import path from "path";
import {ipcRenderer} from "electron";
import log from "electron-log";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {setupAnalytics} from "@app/common/analytics";
import {setupConfig} from "@app/common/config";
import {listenWindowState} from "@app/common/window-state";
import {insertStylesheetFile} from "@app/renderer/amq/stylesheet";
import {setupBackgroundImage, setupDarkTheme, setupTransparency, setupCustomStyle} from "@app/renderer/amq/appearance";

// Easier access to build and appdata path
global.buildPath = path.join(__dirname, "../../../../build/");
global.appDataPath = ipcRenderer.sendSync("get-app-data-path");
setupLoggers();
redirectLoggers();

global.appConfig = setupConfig();
setupAnalytics();

window.addEventListener("DOMContentLoaded", async () => {
    listenWindowState(document.documentElement);

    await setupAppearance();

    await insertStylesheetFile("app", path.join(buildPath, "amq/css/app.css"))
        .catch(() => log.error("Unable to inject app stylesheet."));
});

async function setupAppearance() {
    await setupBackgroundImage();
    await setupTransparency();
    await setupDarkTheme();
    await setupCustomStyle();
}