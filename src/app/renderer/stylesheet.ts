import fs from "fs";
import log from "electron-log";

const styleIdPrefix = "amqe-style-";

export function insertStylesheet(id: string, path: string, isEnabled: boolean = true): Promise<void> {
    id = styleIdPrefix + id;

    return new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) {
            reject(`Stylesheet already exists: ${id}`);
            return;
        }

        fs.readFile(path, "utf-8", (error, style) => {
            if (error) {
                reject(error);
                return;
            }

            const stylesheet = document.createElement("style");
            stylesheet.id = id;
            stylesheet.setAttribute("type", "text/css");
            stylesheet.textContent = style;

            if (!isEnabled) {
                stylesheet.setAttribute("media", "not all");
            }

            document.head.appendChild(stylesheet);
            resolve();
        });
    });
}

export function removeStylesheet(id: string) {
    id = styleIdPrefix + id;

    const stylesheet = document.createElement("style");
    if (!stylesheet) {
        log.error(`Cannot find stylesheet: ${id}`);
        return;
    }

    document.removeChild(stylesheet);
}

export function enableStylesheet(id: string) {
    id = styleIdPrefix + id;

    const stylesheet = document.getElementById(id);
    if (!stylesheet) {
        log.error(`Cannot find stylesheet: ${id}`);
        return;
    }

    stylesheet.removeAttribute("media");
}

export function disableStylesheet(id: string) {
    id = styleIdPrefix + id;

    const stylesheet = document.getElementById(id);
    if (!stylesheet) {
        log.error(`Cannot find stylesheet: ${id}`);
        return;
    }

    stylesheet.setAttribute("media", "not all");
}