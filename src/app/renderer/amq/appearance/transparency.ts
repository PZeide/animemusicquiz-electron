import * as path from "path";
import log from "electron-log";
import { insertStylesheetFile, toggleStylesheet } from "@app/renderer/amq/stylesheet";
import { publicPath } from "@app/common/utils";
import { config, store } from "@app/common/config";

const transparencyStylesheetId = "appearance-transparency";

export async function setupTransparency() {
  await insertStylesheetFile(
    transparencyStylesheetId,
    path.join(publicPath, "amq/styles/transparency.css"),
    config.appearance.transparency
  ).catch((err) => log.warn("Unable to inject transparency stylesheet.", err));

  store.onChange("appearance.transparency", (newValue: boolean | undefined) => {
    toggleStylesheet(transparencyStylesheetId, newValue);
  });
}
