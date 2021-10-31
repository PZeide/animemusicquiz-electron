import path from "path";
import {redirectLoggers, setupLoggers} from "@app/common/log";

// Easier access to build path
global.buildPath = path.join(__dirname, "../../../../build/");

setupLoggers();
redirectLoggers();