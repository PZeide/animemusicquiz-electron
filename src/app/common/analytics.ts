import {app, ipcMain, ipcRenderer} from "electron";
import * as Sentry from "@sentry/electron";

const dsn = "https://8aa85a039b8340c68723375d00e9c447@o1049693.ingest.sentry.io/6037486";

function setupAnalyticsOnBrowser() {
    // Browser process setup should only happen once
    ipcMain.handle("allow-analytics", () => app.isPackaged);

    if (app.isPackaged) {
        Sentry.init({
            dsn: dsn
        });
    }
}

function setupAnalyticsOnRenderer() {
    const allowAnalytics = ipcRenderer.sendSync("allow-analytics")

    if (allowAnalytics) {
        Sentry.init({
            dsn: dsn,
            beforeSend(event) {
                if (appConfig.general.analytics)
                    return event;

                return null;
            }
        });
    }
}

export function setupAnalytics() {
    if (process.type === "browser") {
        setupAnalyticsOnBrowser();
    } else if (process.type === "renderer") {
        setupAnalyticsOnRenderer();
    } else {
        throw Error("Worker process aren't supported.")
    }
}