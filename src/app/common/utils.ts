import * as path from "path";
import { app, ipcRenderer } from "electron";

function computeOrFetch<T>(compute: () => T, ipc: string): T {
  if (process.type === "browser") {
    return compute();
  } else {
    return ipcRenderer.sendSync(ipc) as T;
  }
}

export const publicPath = path.resolve(__dirname, "../../public/");
export const appDataPath = computeOrFetch(() => app.getPath("userData"), "get-app-data-path");

export const isPackaged = computeOrFetch(() => app.isPackaged, "is-packaged");
export const appVersion = computeOrFetch(() => app.getVersion(), "get-app-version");
