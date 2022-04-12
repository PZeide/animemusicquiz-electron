import * as path from "path";
import * as fs from "fs";
import { webFrame } from "electron";
import log from "electron-log";
import { redirectLoggers, setupLoggers } from "@app/common/loggers";
import { setupAnalytics } from "@app/browser/analytics";
import { delegateWindowState } from "@app/renderer/window-state";
import { insertStylesheetFile } from "@app/renderer/amq/stylesheet";
import { publicPath } from "@app/common/utils";
import { setupTransparency } from "@app/renderer/amq/appearance/transparency";
import { setupDarkTheme } from "@app/renderer/amq/appearance/dark";
import { setupCustomStyle } from "@app/renderer/amq/appearance/custom";
import { setupBackground } from "@app/renderer/amq/appearance/background";

setupLoggers();
redirectLoggers();
setupAnalytics();

fs.readFile(path.join(__dirname, "../../amq.js"), "utf-8", (err, inject) => {
  if (err) {
    log.error("Unable to inject main script to AMQ site.", err);
    return;
  }

  webFrame
    .executeJavaScript(inject)
    .then(() => log.info("Successfully injected js to AMQ site."))
    .catch((err) => log.error("An error occurred while executing script into AMQ site.", err));
});

window.addEventListener("DOMContentLoaded", () => {
  delegateWindowState(document.documentElement);

  setupAppearance().catch((err) => console.log("Error setting up appearance", err));
  insertStylesheetFile("app", path.join(publicPath, "amq/styles/app.css")).catch((err) =>
    console.log("Error inserting app stylesheet", err)
  );
});

async function setupAppearance() {
  await setupBackground();
  await setupTransparency();
  await setupDarkTheme();
  await setupCustomStyle();
}
