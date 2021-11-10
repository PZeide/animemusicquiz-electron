import path from "path";
import log from "electron-log";
import {onConfigChange} from "@app/common/config";
import {insertStylesheet, enableStylesheet, disableStylesheet} from "@app/renderer/stylesheet";

//#region Background Image

const backgroundStylesheetId = "appearance-background";
const defaultBackground = "https://animemusicquiz.com/img/backgrounds/normal/bg-x1.jpg";

function updateBackground(newValue?: string) {
    if (newValue) {
        // Add something to the end of the url to force the browser to update the background
        document.documentElement.style.setProperty("--bg", `url(amq-serve://background?${new Date().getTime()})`);
    } else {
        document.documentElement.style.setProperty("--bg", `url(${defaultBackground})`);
    }
}

export async function setupBackgroundImage() {
    await insertStylesheet(backgroundStylesheetId, path.join(buildPath, "amq/css/background.css"))
        .catch(() => log.warn("Unable to inject background stylesheet."));

    updateBackground(appConfig.appearance.backgroundImage);

    onConfigChange<string>("appearance.backgroundImage", (newValue) => {
        updateBackground(newValue);
    });
}

//#endregion Background Image

//#region Transparency

const transparencyStylesheetId = "appearance-transparency";

export async function setupTransparency() {
    await insertStylesheet(transparencyStylesheetId, path.join(buildPath, "amq/css/transparency.css"), appConfig.appearance.transparency)
        .catch(() => log.warn("Unable to inject transparency stylesheet."));

    onConfigChange<boolean>("appearance.transparency", (newValue) => {
        if (newValue) {
            enableStylesheet(transparencyStylesheetId);
        } else {
            disableStylesheet(transparencyStylesheetId);
        }
    });
}

//#endregion Transparency

//#region Dark Theme

const darkStyleSheets: Record<string, string> = {
    "appearance-dark-base": "base.css",
    "appearance-dark-amq": "amq.css",
    "appearance-dark-bootstrap": "bootstrap-main.css",
    "appearance-dark-bootstrap-select": "bootstrap-select.css",
    "appearance-dark-bootstrap-slider": "bootstrap-slider.css",
    "appearance-dark-swal": "swal.css"
};

export async function setupDarkTheme() {
    for (const [id, file] of Object.entries(darkStyleSheets)) {
        await insertStylesheet(id, path.join(buildPath, `amq/css/dark/${file}`), appConfig.appearance.darkTheme)
            .catch(() => log.warn("Unable to inject a dark stylesheet."));
    }

    onConfigChange<boolean>("appearance.darkTheme", (newValue) => {
        for (const id of Object.keys(darkStyleSheets)) {
            if (newValue) {
                enableStylesheet(id);
            } else {
                disableStylesheet(id);
            }
        }
    });
}

//#endregion Dark Theme