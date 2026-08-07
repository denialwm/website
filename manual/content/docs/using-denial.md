---
title: Using Denial
weight: 20
prev: getting-started
next: configuration
---

Denial's reference desktop is the Flutter shell embedded in the compositor.
The shell supplies the launcher, dashboard, overview, system bar, clipboard,
notifications, lock screen, and settings.

## Desktop surfaces

- **Applications** is a searchable launcher. Tap and release `Super`, or move
  the pointer into its configured edge trigger.
- **Dashboard** provides quick access to wallpaper selection, application
  volume, Bluetooth, power modes, and Settings. It is also edge-activated.
- **Overview** shows the current desktop and its windows. Open it with
  `Super+A`.
- **System bar** shows the clock, CPU and supported GPU activity, and active
  MPRIS media. Maximized windows stop at the bar; fullscreen windows cover it.

The launcher and dashboard begin at the left side of the desktop by default.
Their edge, size, position, and close delay can be changed in Settings.

> [!NOTE]
> Managed X11/Xwayland windows currently always use Denial's frame, rounded
> corners, and shadow, even when an application asks to omit them. This avoids
> a known Impeller blur and shadow corruption path when an X11 window is
> minimized. Popup-like and override-redirect X11 surfaces remain undecorated.

## Global shortcuts

Native shortcuts are handled before an application receives the key or mouse
event.

| Shortcut | Action |
| --- | --- |
| Tap `Super` | Open the application launcher |
| `Super+A` | Open the overview |
| `Super+Tab` | Switch windows; repeat `Tab`, then release `Super` to finish |
| `Super+M` | Minimize the focused window |
| `Super+Up` | Toggle maximized state |
| `Super+Shift+Up` | Toggle vertical maximization |
| `Super+F` | Toggle fullscreen |
| `Super+K` | Close the focused window |
| `Super+V` | Open clipboard history |
| `Super+L` | Lock the session |
| `Super+Escape` | Release a captured or constrained pointer |
| `Super` + left-button drag | Move a window |
| `Super` + right-button drag | Resize a window |
| Volume up, down, or mute | Change the default audio output |
| `Super` + volume up or down | Change brightness on the display under the pointer |
| `Ctrl+Alt+Backspace` | End the compositor session immediately |

> [!CAUTION]
> `Ctrl+Alt+Backspace` is an emergency exit. Unsaved application work may be
> lost.

## Clipboard history

Press `Super+V` to open clipboard history. Denial records clipboard activity
from native Wayland and Xwayland applications and can retain text, images,
files, and other advertised representations.

From the clipboard panel you can:

- search and activate an item;
- pin items that should be retained;
- delete one item or clear the history;
- pause new history collection;
- drag an item into an application.

Clipboard history is session UI data. Treat it as sensitive when copying
passwords, tokens, or private files.

## Notifications and media

Denial implements the standard desktop notification service. Notifications
appear in the shell and remain available in the notification center until
they expire or are dismissed. Quiet mode suppresses interruptions, and
lock-screen previews can be limited for privacy.

Applications exposing the MPRIS interface appear in the system bar. The media
popup provides previous, play or pause, and next controls together with
available title, artist, album, and artwork metadata.

## Locking and ending the session

`Super+L` opens the native lock screen. Authentication uses PAM and remains
inside the compositor; an on-screen keyboard is available when needed.

The session menu can lock, log out, suspend, hibernate, reboot, or power off.
System actions are sent through `systemd-logind`, so active inhibitors or
polkit policy may require confirmation or prevent an action.
