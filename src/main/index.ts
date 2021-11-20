import {isLoginPage} from "@amq/utils";
import {setupSettingsCategory} from "@amq/settings";

declare global {
    const options: Options;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoginPage()) {
        setupSettingsCategory();
    }
});