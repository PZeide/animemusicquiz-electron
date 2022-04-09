import { ipcMain } from "electron";
import { appDataPath, appVersion, isPackaged } from "@app/common/utils";

export function setupBrowserIpc() {
  ipcMain.on("is-packaged", (event) => {
    event.returnValue = isPackaged;
  });

  ipcMain.on("get-app-version", (event) => {
    event.returnValue = appVersion;
  });

  ipcMain.on("get-app-data-path", (event) => {
    event.returnValue = appDataPath;
  });
}
