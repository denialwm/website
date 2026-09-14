---
title: Using Denial
weight: 20
prev: getting-started
next: configuration
---

Denial's reference desktop is the Flutter shell embedded in the compositor.
It supplies the launcher, dashboard, overview, system bar, clipboard,
notifications, lock screen, workspaces, and window layouts. Settings is a
separate Wayland application so changing preferences does not add work to the
compositor's Flutter frame.

## Desktop surfaces

- **Applications** is a searchable launcher with keyboard navigation. Tap and
  release `Super`, or move the pointer into its configured edge trigger.
- **Dashboard** provides wallpaper selection, output and application volume,
  Bluetooth, power modes, and Settings. It is also edge-activated.
- **Overview** shows the windows on the current workspace. Open it with
  `Super+A` or a three-finger upward touchpad swipe.
- **System bar** shows the clock, system activity, MPRIS media, notifications,
  StatusNotifier/AppIndicator items, and legacy XEmbed tray icons. Each
  selected display receives its own bar.
- **Settings** opens as a normal Denial-managed Wayland window from the
  launcher, dashboard, mobile home screen, or a configured shortcut.

The launcher, dashboard, notifications, HUDs, and system bar can be moved or
resized in Settings. Maximized windows respect the bar and configured padding;
fullscreen windows cover both.

## Window layouts and workspaces

Choose a window layout in **Settings → Desktop layout**:

- **Stacking** lets windows overlap and preserves freely positioned geometry.
- **Tiling** uses a dynamic dwindle tree. Directional focus, swaps, edge
  resizing, and drag previews remain compositor operations; transient windows
  float.
- **Scrolling** arranges full-height columns in a horizontal strip. Focus
  follows the active column, and horizontal touchpad motion can move the strip
  with velocity-aware settling.

Switching back to Stacking restores saved stacking geometry. The current
layout is global; its window order, split sizes, and scrolling viewport are
retained independently for each monitor-local workspace.

Workspaces are optional and configured per monitor. A monitor switches without
moving the other displays. The workspace count and horizontal or vertical
transition direction are configurable. Minimized windows remain available
from every workspace on their monitor.

## Shortcuts

Shortcuts are handled by the compositor before an application receives the
key or gesture. **Settings → Shortcuts** can add, edit, or remove a binding and
can target a Denial action, an installed desktop application, a program with
literal arguments, or a shell command. Denial validates conflicts before
saving the native-owned `~/.config/denial/shortcuts.json` file.

The current defaults include:

| Shortcut | Action |
| --- | --- |
| Tap `Super` | Open Applications |
| `Super+A` / three-finger swipe up | Open Overview |
| `Super+Tab` / three-finger swipe left or right | Switch windows |
| `Super+M` / `Super+Shift+M` | Minimize the focused window / all windows |
| `Super+W` | Toggle maximized state |
| `Super+Shift+Up` | Toggle vertical maximization |
| `Super+F` | Toggle fullscreen |
| `Super+K` | Close the focused window |
| `Super+Left/Right/Up/Down` | Focus a window in that direction |
| `Super+Ctrl+Left/Right/Up/Down` | Swap a managed window in that direction |
| `Super+Alt+Left/Right` | Switch to the previous or next workspace |
| `Super+Alt+Shift+Left/Right` | Move the focused window to the adjacent workspace |
| `Super+1` … `Super+9` | Switch directly to a workspace |
| `Super+Shift+1` … `Super+Shift+9` | Move the focused window to a workspace |
| Four-finger swipe | Switch workspaces along the configured transition axis |
| `Super+V` | Open clipboard history |
| `Super+Shift+S` | Select and capture a screen region |
| `Super+L` | Lock the session |
| `Super+Space` / `Super+Shift+Space` | Select the next / previous keyboard layout |
| `Super+Escape` | Release a captured or constrained pointer |
| `Super` + left-button drag | Move a window |
| `Super` + right-button drag | Resize a window |
| Volume up, down, or mute | Change the default audio output |
| Brightness keys or `Super` + volume up/down | Change brightness on the display under the pointer |
| `Ctrl+Alt+Backspace` | End the compositor session immediately |

Maximize moved from `Super+Up` to `Super+W` when directional layout navigation
was introduced. Existing shortcut files are migrated. **Toggle always on top**
and **Open Dashboard** are available actions but have no default binding.

> [!CAUTION]
> `Ctrl+Alt+Backspace` is an emergency exit. Unsaved application work may be
> lost.

## Clipboard, notifications, and media

Press `Super+V` to open clipboard history. Denial records native Wayland and
Xwayland clipboard activity and presents searchable text, image, and file
cards. Items can be activated, pinned, deleted, cleared, paused, or dragged
into an application. Clipboard contents are hidden while the session is
locked; still treat the history as sensitive data.

Notifications appear in the shell and remain in notification history until
they expire or are dismissed. Activating a notification can raise its existing
window. Do Not Disturb suppresses ordinary banners, while critical alerts may
still appear; lock-screen previews can show full content, the application only,
or nothing.

Applications exposing MPRIS appear in the system bar. The media popup provides
metadata, artwork, and previous, play/pause, and next actions. Tray items can
expose their application-provided menus and pointer actions.

## Touch and mobile shell

On an ordinary window, direct touch reserves a compositor gesture vocabulary:
dragging from its top 48 logical pixels moves it, pinching resizes it around
its center, a two-finger downward swipe from the top strip minimizes it, and
three simultaneous contacts close it. Once a gesture is recognized, Denial
cancels the application's previous touch sequence.

The explicitly selected mobile shell adds a paged home grid, app recents,
notification history, quick settings, a status bar, mobile wallpaper controls,
an on-screen keyboard, rotation controls, and edge gestures. Cellular status,
mobile data, SIM PIN handling, fingerprint presentation, wake gestures, and
haptic feedback appear only when their corresponding hardware and system
services are available. The public packages still target x86-64 PCs; mobile
deployments currently use architecture-matched source builds.

## Locking and ending the session

`Super+L` closes the native security gate and shows the Flutter lock screen.
Password authentication uses PAM. When fprintd is installed and the user has
an enrolled finger, verification also starts automatically while locked;
password unlock remains available in parallel. Fingerprint enrollment is
managed in Settings after a separate sudo-password check.

The session menu can lock, log out, suspend, hibernate, restart, or power off.
System actions go through the system session service and honor inhibitors and
authorization policy. The Power page can separately schedule idle lock,
display-off, and suspend deadlines and select an available Linux suspend mode.
