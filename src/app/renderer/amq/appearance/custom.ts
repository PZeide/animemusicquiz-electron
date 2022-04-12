import * as fs from "fs";
import * as path from "path";
import { watch } from "chokidar";
import log from "electron-log";
import { editStylesheet, insertStylesheet } from "@app/renderer/amq/stylesheet";
import { appDataPath } from "@app/common/utils";

const customStylesheetId = "custom-css";
const defaultText = "/* You can write your custom style here ! */";

function updateStyle(filePath: string) {
  fs.readFile(filePath, "utf8", (err, style) => {
    if (err) {
      log.warn("Unable to read custom style file.", err);
      return;
    }

    editStylesheet(customStylesheetId, style);
  });
}

export async function setupCustomStyle() {
  const customStyleFile = path.join(appDataPath, "custom-style.css");
  if (!fs.existsSync(customStyleFile)) fs.writeFileSync(customStyleFile, defaultText);

  await insertStylesheet(customStylesheetId, "").catch((err) =>
    log.warn("Unable to inject custom style stylesheet.", err)
  );

  updateStyle(customStyleFile);
  watch(customStyleFile).on("change", () => {
    updateStyle(customStyleFile);
  });
}
