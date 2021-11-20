import {contextBridge, ipcRenderer} from "electron";

const appBridge = {
    config: {
        get(path: string): unknown {
            const paths = path.split(".");
            let parent = appConfig as any;

            if (paths.length > 1) {
                for(let i = 0; i <= paths.length - 2; i++) {
                    parent = parent[paths[i]];
                }
            }

            return parent[paths[paths.length - 1]];
        },

        set(path: string, value: unknown) {
            const paths = path.split(".");
            let parent = appConfig as any;

            if (paths.length > 1) {
                for(let i = 0; i <= paths.length - 2; i++) {
                    parent = parent[paths[i]];
                }
            }

            parent[paths[paths.length - 1]] = value;
        }
    },

    utils: {
        openCustomStyleFile() {
            ipcRenderer.send("open-custom-style-file");
        }
    }
};

export function setupApiBridge() {
    contextBridge.exposeInMainWorld("app", appBridge);
}