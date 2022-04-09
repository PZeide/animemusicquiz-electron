import { ipcRenderer } from "electron";
import { redirectLoggers, setupLoggers } from "@app/common/loggers";
import { setupAnalytics } from "@app/browser/analytics";
import { delegateWindowState } from "@app/renderer/window-state";
import { config, onConfigChange } from "@app/common/config";

setupLoggers();
redirectLoggers();
setupAnalytics();

window.addEventListener("DOMContentLoaded", () => {
  delegateWindowState(document.documentElement);
  setupTitleBarButtons();
  setupDarkThemeVariant();
});

function setupTitleBarButtons() {
  document.getElementById("title-bar-min-button")!.addEventListener("click", () => {
    ipcRenderer.send("title-bar-minimize");
  });

  document.getElementById("title-bar-max-button")!.addEventListener("click", () => {
    ipcRenderer.send("title-bar-maximize");
  });

  document.getElementById("title-bar-unmax-button")!.addEventListener("click", () => {
    ipcRenderer.send("title-bar-unmaximize");
  });

  document.getElementById("title-bar-close-button")!.addEventListener("click", () => {
    ipcRenderer.send("title-bar-close");
  });
}

function setupDarkThemeVariant() {
  if (config.appearance.darkTheme) document.documentElement.classList.add("dark");

  onConfigChange("appearance.darkTheme", (newValue) => {
    document.documentElement.classList.toggle("dark", newValue);
  });
}
