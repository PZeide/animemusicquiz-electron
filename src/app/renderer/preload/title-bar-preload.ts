import path from "path";
import {ipcRenderer} from "electron";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {listenWindowState} from "@app/common/window-state";
import {setupAnalytics} from "@app/common/analytics";
import {setupConfig} from "@app/common/config";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../../../build/");
setupLoggers();
redirectLoggers();

global.appConfig = setupConfig();
setupAnalytics();

window.addEventListener("DOMContentLoaded", () => {
    listenWindowState(document.documentElement);
    setupTitlebarButtons();
});

function setupTitlebarButtons() {
    document.getElementById("title-bar-min-button")!.addEventListener("click", () => {
        ipcRenderer.send("title-bar-ask-minimize");
    });

    document.getElementById("title-bar-max-button")!.addEventListener("click", () => {
        ipcRenderer.send("title-bar-ask-maximize");
    });

    document.getElementById("title-bar-unmax-button")!.addEventListener("click", () => {
        ipcRenderer.send("title-bar-ask-unmaximize");
    });

    document.getElementById("title-bar-close-button")!.addEventListener("click", () => {
        ipcRenderer.send("title-bar-ask-close");
    });
}