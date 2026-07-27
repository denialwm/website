---
title: Screenshots and screen sharing
weight: 50
prev: system-services
next: control-and-recovery
---

Denial implements version 3 of the wlr screencopy protocol. Native Wayland
capture tools can read an entire output or an explicit rectangular region,
and desktop portals turn the same frames into PipeWire streams for
applications.

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
- Portal-based interactive screenshot regions and color picking are not yet
  available for the same reason.
- The Flutter shell draws a software cursor into the desktop atlas, so
  captured frames currently contain the cursor even when the client does not
  request one.
