import * as path from "path";
import {
  disableStylesheet,
  editStylesheet,
  enableStylesheet,
  insertStylesheet,
  insertStylesheetFile,
} from "@app/renderer/amq/stylesheet";
import { appDataPath, publicPath } from "@app/common/utils";
import log from "electron-log";
import { config, onConfigChange } from "@app/common/config";
import { watch } from "chokidar";
import * as fs from "fs";

const backgroundStylesheetId = "appearance-background";
const defaultBackground = "https://animemusicquiz.com/img/backgrounds/normal/bg-x1.jpg";

function updateBackground(newValue?: string) {
  if (newValue) {
    // Add a dynamic value to the end of the url to force the browser to update the background
    document.documentElement.style.setProperty("--bg", `url(amq-serve://background?${Date.now()})`);
  } else {
    document.documentElement.style.setProperty("--bg", `url(${defaultBackground})`);
  }
}

export async function setupBackgroundImage() {
  await insertStylesheetFile(
    backgroundStylesheetId,
    path.join(publicPath, "amq/styles/background.css")
  ).catch(() => log.warn("Unable to inject background stylesheet."));

  updateBackground(config.appearance.backgroundImage);

  onConfigChange("appearance.backgroundImage", (newValue) => {
    updateBackground(newValue);
  });
}

const transparencyStylesheetId = "appearance-transparency";

export async function setupTransparency() {
  await insertStylesheetFile(
    transparencyStylesheetId,
    path.join(publicPath, "amq/styles/transparency.css"),
    config.appearance.transparency
  ).catch(() => log.warn("Unable to inject transparency stylesheet."));

  onConfigChange("appearance.transparency", (newValue) => {
    newValue
      ? enableStylesheet(transparencyStylesheetId)
      : disableStylesheet(transparencyStylesheetId);
  });
}

const darkStyleSheets: Record<string, string> = {
  "appearance-dark-base": "base.css",
  "appearance-dark-amq": "amq.css",
  "appearance-dark-bootstrap": "bootstrap-main.css",
  "appearance-dark-bootstrap-select": "bootstrap-select.css",
  "appearance-dark-bootstrap-slider": "bootstrap-slider.css",
  "appearance-dark-swal": "swal.css",
};

export async function setupDarkTheme() {
  for (const [id, file] of Object.entries(darkStyleSheets)) {
    await insertStylesheetFile(
      id,
      path.join(publicPath, `amq/styles/dark/${file}`),
      config.appearance.darkTheme
    ).catch(() => log.warn(`Unable to inject ${id} dark stylesheet.`));
  }

  onConfigChange("appearance.darkTheme", (newValue) => {
    for (const id of Object.keys(darkStyleSheets)) {
      newValue ? enableStylesheet(id) : disableStylesheet(id);
    }
  });
}

const customStylesheetId = "custom-css";
const defaultText = "/* You can write your custom style here ! */";

function updateStyle(filePath: string) {
  fs.readFile(filePath, "utf8", (err, style) => {
    if (err) {
      log.warn("Unable to read custom stylesheet.", err);
      return;
    }

    editStylesheet(customStylesheetId, style);
  });
}

export async function setupCustomStyle() {
  const customStyleFile = path.join(appDataPath, "custom-style.css");
  fs.writeFile(customStyleFile, defaultText, { flag: "a" }, function (err) {
    if (err) {
      log.warn("Unable to write custom stylesheet.", err);
      return;
    }
  });

  await insertStylesheet(customStylesheetId, "").catch(() =>
    log.warn("Unable to inject custom css stylesheet.")
  );

  updateStyle(customStyleFile);
  watch(customStyleFile).on("change", () => {
    updateStyle(customStyleFile);
  });
}
