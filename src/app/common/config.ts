import {ipcMain, ipcRenderer, app, webContents, WebContents} from "electron";
import Conf from "conf";
import DeepProxy from "proxy-deep";

const callbacks: Record<string, OnConfigChangeCallback<any>[]> = {};

const defaultConfig: AppConfig = {
    general: {
        analytics: true,
        discordIntegration: true,
    },
    appearance: {
        darkTheme: false,
        backgroundImage: "",
        transparency: true
    }
};

function triggerBrowserCallbacks(path: string, newValue: any, oldValue: any, sendTo: WebContents[]) {
    if (path in callbacks) {
        callbacks[path].forEach((callback) => {
            callback(newValue, oldValue);
        });
    }

    sendTo.forEach((webContent) => {
        webContent.send("config-change", path, newValue, oldValue);
    });
}

function triggerRendererCallbacks(path: string, newValue: any, oldValue: any, isOrigin: boolean) {
    if (path in callbacks) {
        callbacks[path].forEach((callback) => {
            callback(newValue, oldValue);
        });
    }

    if (isOrigin) {
        ipcRenderer.send("config-change", path, newValue, oldValue);
    }
}

function createProxiedConfig(configPath: string, appVersion: string): AppConfig {
    const conf = new Conf<AppConfig>({
        cwd: configPath,
        projectVersion: appVersion,
        defaults: defaultConfig
    });

    return new DeepProxy<AppConfig>(defaultConfig, {
        get(target: AppConfig, key: PropertyKey, receiver: any) {
            const val = Reflect.get(target, key, receiver);
            if (typeof val === "object" && val !== null) {
                return this.nest(val);
            } else {
                const path = this.path.join('.') + '.' + key.toString();
                return conf.get(path);
            }
        },

        set(_target: AppConfig, key: PropertyKey, value: any, _receiver: any): boolean {
            const path = this.path.join('.') + '.' + key.toString();

            const oldValue = conf.get(path);
            conf.set(path, value);

            if (process.type === "browser") {
                triggerBrowserCallbacks(path, value, oldValue, webContents.getAllWebContents());
            } else if (process.type === "renderer") {
                triggerRendererCallbacks(path, value, oldValue, true);
            }

            return true;
        }
    });
}

function setupConfigOnBrowser(): AppConfig {
    // Browser process setup should only happen once
    ipcMain.on("config-ask-info", (event) => {
        event.returnValue = [app.getPath("userData"), app.getVersion()];
    });

    ipcMain.on("config-change", (event, path: string, newValue: any, oldValue: any) => {
        // Inform changes to every other renderer processes except one that sends the request
        const to = webContents.getAllWebContents().filter((webContent) => webContent !== event.sender);
        triggerBrowserCallbacks(path, newValue, oldValue, to);
    });

    return createProxiedConfig(app.getPath("userData"), app.getVersion());
}

function setupConfigOnRenderer(): AppConfig {
    ipcRenderer.on("config-change", (_event, path: string, newValue: any, oldValue: any) => {
        triggerRendererCallbacks(path, newValue, oldValue, false);
    });

    const info: [string, string] = ipcRenderer.sendSync("config-ask-info");
    return createProxiedConfig(info[0], info[1]);
}

// How this is working:
// When a config change occur in the browser process, every renderer processes are informed for the changes
// When a config change occur in any renderer process, this process inform the browser process for the changes,
// then, the browser process will inform every other renderer processes for the changes.
export function setupConfig(): AppConfig {
    if (process.type === "browser") {
        return setupConfigOnBrowser();
    } else if (process.type === "renderer") {
        return setupConfigOnRenderer();
    } else {
        throw Error("Worker process aren't supported.");
    }
}

export function onConfigChange<T>(path: string, callback: OnConfigChangeCallback<T>) {
    if (!(path in callbacks)) {
        callbacks[path] = [];
    }

    callbacks[path].push(callback);
}