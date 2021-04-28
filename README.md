# Bottom Triggers Activities Overview

**DEPRECATION NOTICE**: This extension will no longer be maintained. Please migrate to another extension such as https://github.com/jdoda/hotedge

This is a fork of Dash to Dock which allows to toggle Activities overview when the mouse reaches the bottom edge of the screen.
It adds support for Gnome Shell 40 and is mainly aimed at Gnome Shell 40 users to reduce mouse travel.

All credits goes to Dash to Dock, I only simplified their code for my use case.

I may backport fixes from upstream, but I don't intend to add any new feature or fix any bug if I'm not affected. However, I will accept pull requests that keep the extension in the KISS principle. It could be adding a prefs UI for toggle delay and edge(s) triggered, or supporting multiple monitors.


## Installation instructions
In terminal:
```
cd ~/.local/share/gnome-shell/extensions/
git clone https://github.com/papjul/bottom-triggers-activities bottom-triggers-activities\@papjul
```

To update:
```
cd ~/.local/share/gnome-shell/extensions/bottom-triggers-activities\@papjul/
git pull
```

Alternatively, download ZIP from GitHub master and unzip in ~/.local/share/gnome-shell/extensions/bottom-triggers-activities@papjul/ (you need to create the last folder). You will need to update manually.


## Configuration
You can customize the following parameters from the constructor of extension.js:
```
        this._position = St.Side.BOTTOM;
        this._toggleDelay = 0.25;
```


## License
Bottom Triggers Activities Overview Gnome Shell extension is distributed under the terms of the GNU General Public License,
version 2 or later. See the COPYING file for details.
