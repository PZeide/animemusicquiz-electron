import * as path from "path";
import { app, ipcRenderer } from "electron";

function computeOrIpc<T>(compute: () => T, ipc: string): T {
  if (process.type === "browser") {
    return compute();
  } else {
    return ipcRenderer.sendSync(ipc);
  }
}

export const publicPath = path.resolve(__dirname, "../../public/");
export const appDataPath = computeOrIpc(() => app.getPath("userData"), "get-app-data-path");

export const isPackaged = computeOrIpc(() => app.isPackaged, "is-packaged");
export const appVersion = computeOrIpc(() => app.getVersion(), "get-app-version");
