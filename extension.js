// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const GLib = imports.gi.GLib;
const St = imports.gi.St;

const Main = imports.ui.main;
const PointerWatcher = imports.ui.pointerWatcher;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const DOCK_DWELL_CHECK_INTERVAL = 100;


class BottomTriggersActivitiesManager {
    constructor() {
        if (Me.imports.extension.bottomTriggersActivities)
            throw new Error('BottomTriggersActivities has been already initialized');

        Me.imports.extension.bottomTriggersActivities = this;

        // Configuration
        this._position = St.Side.BOTTOM;
        this._toggleDelay = 0.25;

        // Put trigger on the selected monitor
        this._monitorIndex = Main.layoutManager.primaryIndex;
        this._monitor = Main.layoutManager.monitors[this._monitorIndex];

        // Initialize dwelling system variables
        let pointerWatcher = PointerWatcher.getPointerWatcher();
        this._dockDwelling = false;
        this._dockWatch = pointerWatcher.addWatch(DOCK_DWELL_CHECK_INTERVAL, this._checkDockDwell.bind(this));
        this._dockDwellUserTime = 0;
        this._dockDwellTimeoutId = 0;
    }

    _checkDockDwell(x, y) {
        let workArea = Main.layoutManager.getWorkAreaForMonitor(this._monitor.index)
        let shouldDwell;
        // Check for the correct screen edge, extending the sensitive area to the whole workarea,
        // minus 1 px to avoid conflicting with other active corners.
        if (this._position == St.Side.LEFT)
            shouldDwell = (x == this._monitor.x) && (y > workArea.y) && (y < workArea.y + workArea.height);
        else if (this._position == St.Side.RIGHT)
            shouldDwell = (x == this._monitor.x + this._monitor.width - 1) && (y > workArea.y) && (y < workArea.y + workArea.height);
        else if (this._position == St.Side.TOP)
            shouldDwell = (y == this._monitor.y) && (x > workArea.x) && (x < workArea.x + workArea.width);
        else if (this._position == St.Side.BOTTOM)
            shouldDwell = (y == this._monitor.y + this._monitor.height - 1) && (x > workArea.x) && (x < workArea.x + workArea.width);

        if (shouldDwell) {
            // We only set up dwell timeout when the user is not hovering over the dock
            // already (!this._box.hover).
            // The _dockDwelling variable is used so that we only try to
            // fire off one dock dwell - if it fails (because, say, the user has the mouse down),
            // we don't try again until the user moves the mouse up and down again.
            if (!this._dockDwelling && /*!this._box.hover &&*/ this._dockDwellTimeoutId == 0) {
                // Save the interaction timestamp so we can detect user input
                let focusWindow = global.display.focus_window;
                this._dockDwellUserTime = focusWindow ? focusWindow.user_time : 0;

                this._dockDwellTimeoutId = GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT,
                    this._toggleDelay * 1000,
                    this._dockDwellTimeout.bind(this));
                GLib.Source.set_name_by_id(this._dockDwellTimeoutId, '[dash-to-dock] this._dockDwellTimeout');
            }
            this._dockDwelling = true;
        }
        else {
            this._cancelDockDwell();
            this._dockDwelling = false;
        }
    }

    _cancelDockDwell() {
        if (this._dockDwellTimeoutId != 0) {
            GLib.source_remove(this._dockDwellTimeoutId);
            this._dockDwellTimeoutId = 0;
        }
    }

    _dockDwellTimeout() {
        this._dockDwellTimeoutId = 0;

        if (this._monitor.inFullscreen)
            return GLib.SOURCE_REMOVE;

        // We don't want to open the tray when a modal dialog
        // is up, so we check the modal count for that. When we are in the
        // overview we have to take the overview's modal push into account
        if (Main.modalCount > (Main.overview.visible ? 1 : 0))
            return GLib.SOURCE_REMOVE;

        // If the user interacted with the focus window since we started the tray
        // dwell (by clicking or typing), don't activate the message tray
        let focusWindow = global.display.focus_window;
        let currentUserTime = focusWindow ? focusWindow.user_time : 0;
        if (currentUserTime != this._dockDwellUserTime)
            return GLib.SOURCE_REMOVE;

        Main.overview.toggle();
        return GLib.SOURCE_REMOVE;
    }

    static getDefault() {
        return Me.imports.extension.bottomTriggersActivities
    }

    destroy() {
        // Remove pointer watcher
        if (this._dockWatch) {
            PointerWatcher.getPointerWatcher()._removeWatch(this._dockWatch);
            this._dockWatch = null;
        }

        Me.imports.extension.bottomTriggersActivities = null;
    }
}



let bottomTriggersActivitiesManager;

function enable() {
    bottomTriggersActivitiesManager = new BottomTriggersActivitiesManager();
}

function disable() {
    bottomTriggersActivitiesManager.destroy();
}
