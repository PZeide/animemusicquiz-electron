import * as fs from "fs";
import log from "electron-log";

const styleIdPrefix = "amqe-style-";

export function insertStylesheet(id: string, style: string, isEnabled = true): Promise<void> {
  const insertionId = styleIdPrefix + id;
  return new Promise<void>((resolve, reject) => {
    if (isStylesheetInserted(id)) {
      reject(`Stylesheet with id ${id} already inserted.`);
    }

    const stylesheet = document.createElement("style");
    stylesheet.id = insertionId;
    stylesheet.setAttribute("type", "text/css");
    stylesheet.textContent = style;

    if (!isEnabled) stylesheet.setAttribute("media", "not all");

    document.head.appendChild(stylesheet);
    resolve();
  });
}

export function insertStylesheetFile(id: string, path: string, isEnabled = true): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.readFile(path, "utf-8", (err: NodeJS.ErrnoException | null, style: string) => {
      if (err) {
        reject(err);
        return;
      }

      insertStylesheet(id, style, isEnabled).then(resolve).catch(reject);
    });
  });
}

export function removeStylesheet(id: string) {
  const insertionId = styleIdPrefix + id;
  const stylesheet = document.getElementById(insertionId);
  if (stylesheet === null) {
    log.error(`Cannot find stylesheet: ${id}.`);
    return;
  }

  document.removeChild(stylesheet);
}

export function enableStylesheet(id: string) {
  const insertionId = styleIdPrefix + id;
  const stylesheet = document.getElementById(insertionId);
  if (stylesheet === null) {
    log.error(`Cannot find stylesheet: ${id}.`);
    return;
  }

  stylesheet.removeAttribute("media");
}

export function disableStylesheet(id: string) {
  const insertionId = styleIdPrefix + id;
  const stylesheet = document.getElementById(insertionId);
  if (stylesheet === null) {
    log.error(`Cannot find stylesheet: ${id}.`);
    return;
  }

  stylesheet.setAttribute("media", "not all");
}

export function toggleStylesheet(id: string, force?: boolean) {
  if (force === undefined) {
    isStylesheetInserted(id) ? disableStylesheet(id) : enableStylesheet(id);
  } else {
    force ? enableStylesheet(id) : disableStylesheet(id);
  }
}

export function editStylesheet(id: string, style: string) {
  const insertionId = styleIdPrefix + id;
  const stylesheet = document.getElementById(insertionId);
  if (stylesheet === null) {
    log.error(`Cannot find stylesheet: ${id}.`);
    return;
  }

  stylesheet.textContent = style;
}

export function isStylesheetInserted(id: string) {
  return document.getElementById(styleIdPrefix + id) !== null;
}
