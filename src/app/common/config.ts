import * as path from "path";
import { appDataPath } from "@app/common/utils";
import { Store, StoreMigration } from "@app/common/store";

export interface BackgroundCollection {
  files: string[];
  rotationTime: number;
  blur: number;
}

export interface AppConfig {
  general: {
    analytics: boolean;
    discordIntegration: boolean;
  };

  appearance: {
    customTitleBar: boolean;
    darkTheme: boolean;
    transparency: boolean;
    background: {
      collections: Record<string, BackgroundCollection>;
      current: string;
    };
  };
}

const defaultConfig: AppConfig = {
  general: {
    analytics: true,
    discordIntegration: true,
  },
  appearance: {
    customTitleBar: true,
    darkTheme: false,
    transparency: true,
    background: {
      collections: {
        ["Default"]: {
          files: ["$default"],
          rotationTime: -1,
          blur: 0,
        },
      },
      current: "Default",
    },
  },
};

const migrations: Record<string, StoreMigration<AppConfig>> = {};

export const configVersion = "1.0.0";

export const store = new Store<AppConfig>(
  path.join(appDataPath, "config.json"),
  defaultConfig,
  configVersion,
  migrations
);

export const config = store.config;
