import * as path from "path";
import * as fs from "fs";
import { webFrame } from "electron";
import log from "electron-log";
import { redirectLoggers, setupLoggers } from "@app/common/loggers";
import { setupAnalytics } from "@app/browser/analytics";
import { delegateWindowState } from "@app/renderer/window-state";
import { insertStylesheetFile } from "@app/renderer/amq/stylesheet";
import { publicPath } from "@app/common/utils";
import {
  setupBackgroundImage,
  setupCustomStyle,
  setupDarkTheme,
  setupTransparency,
} from "@app/renderer/amq/appearance";

setupLoggers();
redirectLoggers();
setupAnalytics();

fs.readFile(path.join(__dirname, "../../amq.js"), "utf-8", (error, inject) => {
  if (error) {
    log.error("Unable to inject main script to AMQ site.");
    return;
  }

  webFrame
    .executeJavaScript(inject)
    .then(() => log.info("Successfully injected js to AMQ site."))
    .catch((e) => log.error("An error occurred while executing script into AMQ site.", e));
});

window.addEventListener("DOMContentLoaded", async () => {
  delegateWindowState(document.documentElement);

  await setupAppearance();
  await insertStylesheetFile("app", path.join(publicPath, "amq/styles/app.css")).catch(() =>
    log.error("Unable to inject app stylesheet.")
  );
});

async function setupAppearance() {
  await setupBackgroundImage();
  await setupTransparency();
  await setupDarkTheme();
  await setupCustomStyle();
}
