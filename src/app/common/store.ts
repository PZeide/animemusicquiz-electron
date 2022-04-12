import * as fs from "fs";
import * as path from "path";
import * as clone from "rfdc";
import * as objectPath from "object-path";
import { compareBuild } from "semver";
import { watch } from "chokidar";
import { DeepProxy } from "@qiwi/deep-proxy";

type StoreState<T> = T & { version: string };

export type StoreMigration<T> = (store: T) => void;
export type StoreChangeCallback<T> = (newValue?: T, oldValue?: T) => void;
export type StoreChangeUnsubscribe = () => void;

export class Store<T> {
  private readonly _filePath: string;
  private readonly _default: StoreState<T>;
  private _state: StoreState<T>;
  private readonly _callbacksMap: Map<string, StoreChangeCallback<unknown>[]>;

  readonly config: T;

  constructor(
    configFilePath: string,
    defaultConfig: T,
    version: string,
    migrations: Record<string, StoreMigration<T>>
  ) {
    this._filePath = configFilePath;
    this._default = { version, ...defaultConfig };
    this._state = this._loadConfig(migrations);
    this._callbacksMap = new Map<string, StoreChangeCallback<unknown>[]>();
    this._watchExternalChanges();

    this.config = this._createProxiedConfig();
  }

  onChange<T>(path: string, callback: StoreChangeCallback<T>): StoreChangeUnsubscribe {
    if (!this._callbacksMap.has(path)) {
      this._callbacksMap.set(path, []);
    }

    const callbacks = this._callbacksMap.get(path) ?? [];

    return () => {
      const index = callbacks.findIndex((candidate) => candidate === callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  private _serialize(value: StoreState<T>): string {
    return JSON.stringify(value, null, 2);
  }

  private _callChangeCallbacks(path: string, newValue?: unknown, oldValue?: unknown) {
    const callbacks = this._callbacksMap.get(path);
    if (callbacks) callbacks.forEach((callback) => callback(newValue, oldValue));
  }

  private _write(state: StoreState<T> = this._state) {
    if (this._checkFile()) return;
    fs.writeFileSync(this._filePath, this._serialize(state));
  }

  private _loadConfig(migrations: Record<string, StoreMigration<T>>): StoreState<T> {
    if (this._checkFile()) return clone()(this._default);

    const data = fs.readFileSync(this._filePath, "utf8");
    const state = JSON.parse(data) as StoreState<T>;
    if (this._migrate(state, migrations)) this._write(state);
    return state;
  }

  private _checkFile(): boolean {
    if (fs.existsSync(this._filePath)) return false;

    fs.mkdirSync(path.dirname(this._filePath), { recursive: true });
    fs.writeFileSync(this._filePath, this._serialize(this._default));
    return true;
  }

  private _migrate(state: StoreState<T>, migrations: Record<string, StoreMigration<T>>): boolean {
    let migrated = false;
    const candidateMigrations = Object.entries(migrations).filter(
      ([version]) => compareBuild(version, state.version) > 0
    );

    for (const [version, migration] of candidateMigrations) {
      migration(state);
      state.version = version;
      migrated = true;
    }

    return migrated;
  }

  private _watchExternalChanges() {
    watch(this._filePath, {
      awaitWriteFinish: {
        stabilityThreshold: 200,
      },
    }).on("change", () => {
      const data = fs.readFileSync(this._filePath, "utf8");
      if (data === this._serialize(this._state)) return;
      const newState = JSON.parse(data) as StoreState<T>;

      const changes = this._findDeepChanges(newState, this._state);
      for (const [path, [newValue, oldValue]] of Object.entries(changes)) {
        this._callChangeCallbacks(path, newValue, oldValue);
      }

      this._state = newState;
    });
  }

  private _findDeepChanges(
    newObj: Record<string, unknown>,
    currentObj: Record<string, unknown>,
    path: string[] = []
  ): Record<string, [unknown, unknown]> {
    const result: Record<string, [unknown, unknown]> = {};

    for (const [key, value] of Object.entries(newObj)) {
      const newPath = [...path, key];
      const currentValue = currentObj[key];

      if (currentValue === undefined || currentValue === null) {
        result[newPath.join(".")] = [value, undefined];
      } else if (typeof value === "object") {
        if (typeof currentValue !== "object") {
          result[newPath.join(".")] = [value, currentValue];
        } else if (Array.isArray(value)) {
          if (
            !Array.isArray(currentValue) ||
            value.length !== currentValue.length ||
            value.find((item, index) => currentValue[index] !== item)
          ) {
            result[newPath.join(".")] = [value, currentValue];
          }
        } else {
          Object.assign(
            result,
            this._findDeepChanges(
              value as Record<string, unknown>,
              currentValue as Record<string, unknown>,
              newPath
            )
          );
        }
      } else if (value !== currentValue) {
        result[newPath.join(".")] = [value, currentValue];
      }
    }

    return result;
  }

  private _createProxiedConfig(): T {
    return new DeepProxy(this._default, ({ trapName, value, path, key, PROXY }) => {
      const dotPath = path.join(".") + `.${key?.toString() ?? "unknown"}`;

      if (trapName === "get") {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          return PROXY;
        }

        return objectPath.get(this._state, dotPath) as unknown;
      }

      if (trapName === "set") {
        const oldValue = objectPath.get(this._state, dotPath) as unknown;
        if (oldValue === value) return true;
        objectPath.set(this._state, dotPath, value);
        this._callChangeCallbacks(dotPath, value, oldValue);
        this._write();
        return true;
      }

      throw new TypeError("Trap not implemented.");
    });
  }
}
