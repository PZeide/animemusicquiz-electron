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

  return new DeepProxy(defaultConfig, ({ trapName, value, path, PROXY }) => {
    if (trapName === "get") {
      if (typeof value === "object" && value !== null) {
        return PROXY;
      }

      return conf.get(path.join("."));
    }

    if (trapName === "set") {
      conf.set(path.join("."), value);
      return true;
    }

    throw new TypeError("Trap not implemented");
  });

  /*return new DeepProxy<AppConfig>({} as AppConfig, {
    get(target: AppConfig, key: PropertyKey, receiver: any) {
      const val = Reflect.get(target, key, receiver);
      if (typeof val === "object" && val !== null) {
        return this.nest(val);
      } else {
        const path = this.path.join(".") + "." + key.toString();
        return conf.get(path);
      }
    },

    set(target: AppConfig, key: PropertyKey, value: any): boolean {
      const path = this.path.join(".") + "." + key.toString();
      conf.set(path, value);
      return true;
    },
  });*/
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
