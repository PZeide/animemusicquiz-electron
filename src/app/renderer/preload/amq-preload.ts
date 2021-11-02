import path from "path";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {app} from "electron";
import {setupAnalytics} from "@app/common/analytics";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../../../build/");

setupLoggers();
redirectLoggers();

if (app.isPackaged) {
    // Enable analytics only in dev environment
    setupAnalytics();
}