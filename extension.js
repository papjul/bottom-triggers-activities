// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const BottomTriggersActivities = Me.imports.bottomTriggersActivities;

function enable() {
    new BottomTriggersActivities.BottomTriggersActivitiesManager();
}

function disable() {
    BottomTriggersActivities.destroy();
}
