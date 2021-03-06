import {BrowserView, BrowserWindow} from "electron";

declare global {
    // Available in both browser and renderer process
    var buildPath: string;
    var appDataPath: string;
    var appConfig: AppConfig;

    // Available in browser process only
    var browserWindow: BrowserWindow;
    var amqBrowserView: BrowserView;
}