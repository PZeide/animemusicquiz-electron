import * as path from "path";
import log from "electron-log";
import { publicPath } from "@app/common/utils";
import { config, store } from "@app/common/config";
import { insertStylesheetFile, toggleStylesheet } from "@app/renderer/amq/stylesheet";

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
    ).catch((err) => log.warn(`Unable to inject ${id} dark stylesheet.`, err));
  }

  store.onChange("appearance.darkTheme", (newValue: boolean | undefined) => {
    for (const id of Object.keys(darkStyleSheets)) {
      toggleStylesheet(id, newValue);
    }
  });
}
