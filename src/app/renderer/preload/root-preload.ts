import path from "path";
import {ipcRenderer} from "electron";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {listenWindowState} from "@app/common/window-state";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../../../build/");

setupLoggers();
redirectLoggers();

window.addEventListener("DOMContentLoaded", () => {
    listenWindowState(document.documentElement);
    setupTitlebarButtons();
});

function setupTitlebarButtons() {
    document.getElementById("title-bar-min-button")!.addEventListener("click", () => {
        ipcRenderer.send("root-ask-minimize");
    });

    document.getElementById("title-bar-max-button")!.addEventListener("click", () => {
        ipcRenderer.send("root-ask-maximize");
    });

    document.getElementById("title-bar-unmax-button")!.addEventListener("click", () => {
        ipcRenderer.send("root-ask-unmaximize");
    });

    document.getElementById("title-bar-close-button")!.addEventListener("click", () => {
        ipcRenderer.send("root-ask-close");
    });
}