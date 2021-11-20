import path from "path";
import {ipcMain, shell} from "electron";
import log from "electron-log";

export function setupIpcUtils() {
    ipcMain.on("open-custom-style-file", () => {
        shell.openExternal(path.join(appDataPath, "customstyle.scss"))
            .catch(() => log.error("Unable to open custom style file."))
    });
}