import log from "electron-log";

export function setupLoggers() {
  log.catchErrors({
    showDialog: true,
    onError(error: Error) {
      log.error(error);
    },
  });

  log.transports.console.format = "{h}:{i}:{s}.{ms} {processType}: {text}";
  log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
}

export function redirectLoggers() {
  Object.assign(console, log.functions);
}
