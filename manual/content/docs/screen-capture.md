---
title: Screenshots and screen sharing
weight: 50
prev: system-services
next: control-and-recovery
---

Denial has a built-in region screenshot flow and implements version 3 of the
wlr screencopy protocol for external tools. Desktop portals turn screencopy
frames into PipeWire streams for browsers and sandboxed applications.

## Built-in screenshots

Press `Super+Shift+S` to freeze the current desktop. The output under the
pointer supplies the capture frame clock; drag over the area to capture
anywhere on the desktop, or cancel with `Escape` or the right mouse button.

Denial writes a uniquely named PNG to:

1. the directory in `DENIAL_SCREENSHOT_DIR`, when set; or
2. `~/Pictures/Screenshots` by default.

The PNG is also placed on the clipboard, ready to paste into applications
that accept images. The selection canvas deliberately hides the software
cursor. On the mobile shell, the Screenshot quick setting captures the full
desktop without opening the region selector.

The shortcut can be changed or disabled in **Settings → Shortcuts**.

## Screenshots with grim

Install the direct capture utilities if needed:

```sh
sudo pacman -S grim wf-recorder
```

Capture the desktop:

```sh
grim screenshot.png
```

Select an output by its connector name:

```sh
denialctl outputs
grim -o DP-1 screenshot.png
```

Capture a known region using logical coordinates:

```sh
grim -g "100,100 1280x720" region.png
```

## Recording with wf-recorder

Record the screen until `wf-recorder` is stopped:

```sh
wf-recorder -f recording.mp4
```

Add desktop audio, select one output, or use an explicit region:

```sh
wf-recorder -a -f recording-with-audio.mp4
wf-recorder -o DP-1 -f recording.mp4
wf-recorder -g "100,100 1280x720" -f region.mp4
```

## Browsers, OBS, and sandboxed applications

The Arch package installs portal routing that sends ScreenCast and Screenshot
requests to `xdg-desktop-portal-wlr`; other desktop portal requests use the
GTK backend. A Zenity monitor chooser is used because it works as a normal
desktop window.

The complete path is:

```text
application → desktop portal → xdg-desktop-portal-wlr → Denial screencopy
            → PipeWire stream → application
```

If an application offers a system screen-sharing dialog, choose the monitor
there. The compositor itself does not link PipeWire; the portal backend owns
the stream.

## Current limitations

- `slurp` requires layer-shell, which Denial does not currently advertise.
  Interactive `slurp` region selection is therefore unavailable; explicit
  coordinates still work.
- Portal-based interactive screenshot regions and colour picking are not yet
  available for the same reason.
- Direct screencopy clients can receive the Flutter-owned software cursor even
  when they do not request one. Denial's built-in screenshot flow explicitly
  hides it before capturing.
