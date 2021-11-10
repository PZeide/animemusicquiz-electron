import {ipcRenderer, BrowserWindow, WebContents} from "electron";

export function setupWindowStateListeners(window: BrowserWindow, ...targets: WebContents[]) {
    window.on("maximize", () => {
        targets.forEach((target) => {
            target.send("window-maximize");
        });
    });

    window.on("unmaximize", () => {
        targets.forEach((target) => {
            target.send("window-unmaximize");
        });
    });

    window.on("enter-full-screen", () => {
        targets.forEach((target) => {
            target.send("window-enter-full-screen");
        });
    });

    window.on("leave-full-screen", () => {
        targets.forEach((target) => {
            target.send("window-leave-full-screen");
        });
    });
}

export function listenWindowState(target: Element) {
    ipcRenderer.on("window-maximize", () => {
        target.classList.add("maximized");
    });

    ipcRenderer.on("window-unmaximize", () => {
        target.classList.remove("maximized");
    });

    ipcRenderer.on("window-enter-full-screen", () => {
        target.classList.add("fullscreen");
    });

    ipcRenderer.on("window-leave-full-screen", () => {
        target.classList.remove("fullscreen");
    });
}