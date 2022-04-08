import { ipcRenderer } from "electron";

export function delegateWindowState(target: Element) {
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
