import path from "path";
import {redirectLoggers, setupLoggers} from "@app/common/log";
import {setupAnalytics} from "@app/common/analytics";
import {setupConfig} from "@app/common/config";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../../../build/");
global.appConfig = setupConfig();

setupLoggers();
redirectLoggers();

setupAnalytics();