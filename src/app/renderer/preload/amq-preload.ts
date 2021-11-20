import path from "path";
import fs from "fs";
import {ipcRenderer, webFrame} from "electron";
import log from "electron-log";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {setupAnalytics} from "@app/common/analytics";
import {setupConfig} from "@app/common/config";
import {listenWindowState} from "@app/common/window-state";
import {insertStylesheetFile} from "@app/renderer/amq/stylesheet";
import {setupBackgroundImage, setupDarkTheme, setupTransparency, setupCustomStyle} from "@app/renderer/amq/appearance";
import {setupApiBridge} from "@app/renderer/amq/api/bridge";

// Easier access to build and appdata path
global.buildPath = path.join(__dirname, "../../../../build/");
global.appDataPath = ipcRenderer.sendSync("get-app-data-path");
setupLoggers();
redirectLoggers();

global.appConfig = setupConfig();
setupAnalytics();

setupApiBridge();
fs.readFile(path.join(__dirname, "../../../bundle.js"), "utf-8", (error, inject) => {
    if (error) {
        log.error("Unable to inject main script to AMQ site.");
        return;
    }

    webFrame.executeJavaScript(inject)
        .then(() => log.info("Successfully injected js to AMQ site."))
        .catch(() => log.error("An error occurred while executing script into AMQ site."));
});

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