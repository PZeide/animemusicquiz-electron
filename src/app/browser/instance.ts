import {app} from "electron";
import log from "electron-log";

export function setupSingleInstanceLock(): boolean {
    app.on("second-instance", () => {
        log.info("A second instance has tried to be run, forcing app to foreground.");

        if (browserWindow) {
            if (browserWindow.isMinimized())
                browserWindow.restore();

            browserWindow.focus();
        }
    });

    return app.requestSingleInstanceLock();
}