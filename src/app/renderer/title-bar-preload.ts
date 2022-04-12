import { ipcRenderer } from "electron";
import { redirectLoggers, setupLoggers } from "@app/common/loggers";
import { setupAnalytics } from "@app/browser/analytics";
import { delegateWindowState } from "@app/renderer/window-state";
import { config, store } from "@app/common/config";

setupLoggers();
redirectLoggers();
setupAnalytics();

window.addEventListener("DOMContentLoaded", () => {
  delegateWindowState(document.documentElement);
  setupTitleBarButtons();
  setupDarkThemeVariant();
});

function setupTitleBarButtons() {
  document.getElementById("title-bar-min-button")?.addEventListener("click", () => {
    ipcRenderer.send("title-bar-minimize");
  });

  document.getElementById("title-bar-max-button")?.addEventListener("click", () => {
    ipcRenderer.send("title-bar-maximize");
  });

  document.getElementById("title-bar-unmax-button")?.addEventListener("click", () => {
    ipcRenderer.send("title-bar-unmaximize");
  });

  document.getElementById("title-bar-close-button")?.addEventListener("click", () => {
    ipcRenderer.send("title-bar-close");
  });
}

function setupDarkThemeVariant() {
  document.documentElement.classList.toggle("dark", config.appearance.darkTheme);
  store.onChange("appearance.darkTheme", (newValue: boolean | undefined) => {
    document.documentElement.classList.toggle("dark", newValue);
  });
}
