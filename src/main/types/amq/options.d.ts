declare interface Options {
    $SETTING_TABS: JQuery;
    $SETTING_CONTAINERS: JQuery;

    selectTab(settingsContainerId: string, tab: JQuery): void;
}