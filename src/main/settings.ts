const configSchema: ConfigSchema = [
    {
        name: "General",
        config: [
            {
                id: "smAppAnalytics",
                label: "Analytics",
                description: "Analytics collects errors and crashes to fixes them.",
                value: () => window.app.config.get("general.analytics"),
                onChange: (value: boolean) => {
                    window.app.config.set("general.analytics", value);
                    return true;
                }
            },
            {
                id: "smAppDiscordIntegration",
                label: "Discord Integration",
                description: "Discord integration allow users on Discord to see your lobby in directly join it if the lobby is public. If the lobby is private, users are able to ask you to join.",
                value: () => window.app.config.get("general.discordIntegration"),
                onChange: (value: boolean) => {
                    window.app.config.set("general.discordIntegration", value);
                    return true;
                }
            }
        ]
    },
    {
        name: "Appearance",
        config: [
            {
                id: "smAppearanceBackgroundImage",
                label: "Background Image",
                description: "The file that should show as background image.",
                render: renderFileChooserSetting,
                value: () => window.app.config.get("appearance.backgroundImage"),
                onChange: (value: string) => {
                    window.app.config.set("appearance.backgroundImage", value);
                    return true;
                }
            },
            {
                id: "smAppearanceTransparency",
                label: "Transparency",
                description: "Some container look transparents.",
                value: () => window.app.config.get("appearance.transparency"),
                onChange: (value: boolean) => {
                    window.app.config.set("appearance.transparency", value);
                    return true;
                }
            },
            {
                id: "smAppearanceDark",
                label: "Dark Theme",
                description: "Turn dark any white elements.",
                value: () => window.app.config.get("appearance.darkTheme"),
                onChange: (value: boolean) => {
                    window.app.config.set("appearance.darkTheme", value);
                    return true;
                }
            },
            {
                id: "smAppearanceCustomStyle",
                label: "Custom Style",
                description: "Open a SCSS file to apply your own custom style.",
                render: renderCustomStyleButton,
                value: () => null,
                onChange: (_value: null) => {
                    return true;
                }
            }
        ]
    }
];

export function setupSettingsCategory() {
    /* Tab category */
    $("#settingModal .tabContainer")
        .append($("<div>")
            .addClass("tab leftRightButtonTop clickAble")
            .on("click", function(this: HTMLDivElement) {
                options.selectTab("amqeSettingsContainer", $(this));
            })
            .append($("<h5>")
                .text("App")
            )
        );

    /* Settings container */
    $("#settingModal .modal-body")
        .append($("<div>")
            .attr("id", "amqeSettingsContainer")
            .addClass("settingContentContainer hide")
            .append($("<div>")
                .addClass("row")
            )
        );

    populateSettings();
    // Refresh options.$SETTINGS_TAB and options.$SETTING_CONTAINERS selectors
    options.$SETTING_TABS = $("#settingModal .tab");
    options.$SETTING_CONTAINERS = $(".settingContentContainer");
}

function populateSettings() {
    const container = $("#amqeSettingsContainer > .row");

    for (const category of configSchema) {
        const categoryContainer = $("<div>")
            .addClass("col-xs-6 text-center")
            .append($("<div>")
                .append($("<label>")
                    .text(category.name)
                )
            );

        container.append(categoryContainer);

        for (const setting of category.config) {
            const value = setting.value();

            if (setting.render) {
                setting.render(setting, categoryContainer, value);
            } else if(typeof value === "boolean") {
                renderBooleanSetting(setting, categoryContainer, value);
            }
        }
    }
}

function hoverLabel(setting: ConfigSchemaElement<any>) {
    return $("<label>")
        .addClass("customSettingContainerLabel")
        .text(setting.label)
        .attr("data-toggle", "popover")
        .attr("data-content", setting.description)
        .attr("data-trigger", "hover")
        .attr("data-html", "true")
        .attr("data-placement", "top")
        .attr("data-container", "#settingsModal");
}

function renderBooleanSetting(setting: ConfigSchemaElement<boolean>, container: JQuery, defaultValue: boolean) {
    container.append($("<div>")
        .addClass("customSettingContainer")
        .append($("<div>")
            .addClass("customCheckbox")
            .append($(`<input id="${setting.id}" type="checkbox">`)
                .prop("checked", defaultValue)
                .on("change", function (event) {
                    const result = setting.onChange($(this).prop("checked"));

                    if (!result)
                        event.preventDefault();
                })
            )
            .append($(`<label for="${setting.id}"><i class="fa fa-check" aria-hidden="true"></i></label>`))
        )
        .append(hoverLabel(setting))
    );
}

function renderFileChooserSetting(setting: ConfigSchemaElement<string>, container: JQuery, _defaultValue: string) {
    container.append($("<div>")
        .addClass("customSettingContainer")
        .append($("<div>")
            .addClass("customInput")
            .append($(`<input id="${setting.id}" type="button" class="btn btn-info" value="Choose a file">`)
                .on("click", function (_event) {
                    $("<input type='file' accept='image/*'>")
                        .on("change", function (event) {
                            const target = event.target as HTMLInputElement;
                            setting.onChange(target.files![0].path);
                        })
                        .trigger("click");
                })
            )
        )
        .append(hoverLabel(setting))
    );
}

function renderCustomStyleButton(setting: ConfigSchemaElement<null>, container: JQuery, _defaultValue: null) {
    container.append($("<div>")
        .addClass("customSettingContainer")
        .append($("<div>")
            .addClass("customInput")
            .append($(`<input id="${setting.id}" type="button" class="btn btn-info" value="Open file">`)
                .on("click", function (_event) {
                    window.app.utils.openCustomStyleFile();
                })
            )
        )
        .append(hoverLabel(setting))
    );
}