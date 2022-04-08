import { ipcMain } from "electron";
import { appDataPath, appVersion, buildPath, isPackaged } from "@app/common/utils";

export function setupBrowserIpc() {
  ipcMain.on("is-packaged", (event) => {
    event.returnValue = isPackaged;
  });

  ipcMain.on("get-app-version", (event) => {
    event.returnValue = appVersion;
  });

  ipcMain.on("get-build-path", (event) => {
    event.returnValue = buildPath;
  });

  ipcMain.on("get-app-data-path", (event) => {
    event.returnValue = appDataPath;
  });
}
