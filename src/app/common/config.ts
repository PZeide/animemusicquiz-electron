import Conf from "conf";
import { appDataPath, appVersion } from "@app/common/utils";
import { DeepProxy } from "@qiwi/deep-proxy";

const callbacks: Record<string, OnConfigChangeCallback<any>[]> = {};

const defaultConfig: AppConfig = {
  general: {
    analytics: true,
    discordIntegration: true,
  },
  appearance: {
    darkTheme: false,
    backgroundImage: "",
    transparency: true,
  },
};

function createProxiedConfig(): AppConfig {
  const conf = new Conf({
    cwd: appDataPath,
    projectVersion: appVersion,
    watch: true,
    defaults: defaultConfig,
  });

  return new DeepProxy(defaultConfig, ({ trapName, value, path, key, PROXY }) => {
    if (trapName === "get") {
      if (typeof value === "object" && value !== null) {
        return PROXY;
      }

      return conf.get(path.join(".") + `.${key}`);
    }

    if (trapName === "set") {
      conf.set(path.join(".") + `.${key}`, value);
      return true;
    }

    throw new TypeError("Trap not implemented");
  });
}

export const config = createProxiedConfig();

export function onConfigChange<P extends Paths<AppConfig>>(
  path: P,
  callback: OnConfigChangeCallback<Get<AppConfig, P>>
) {
  if (!(path in callbacks)) {
    callbacks[path] = [];
  }

  callbacks[path].push(callback);
}
