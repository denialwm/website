---
title: Settings and displays
weight: 30
prev: using-denial
next: system-services
---

Most configuration is available in Denial Settings and is applied while the
session is running. Display state is validated as one transaction so an
invalid partial layout is not left active.

## Settings

Settings is divided into a few practical groups:

| Page | What it controls |
| --- | --- |
| Appearance | Accent source, corner radius, opacity, blur, and focused-window treatment |
| Animations | Animation speed, panel motion, lock animation, and window close effect |
| Desktop layout | System bar placement, selected displays, thickness, and maximize padding |
| Overlays | Launcher, dashboard, notification, and system-HUD placement and size |
| Lock screen | Wallpaper, dimming, blur, clock scale, and status visibility |
| Audio | Output volume, mute state, and application streams |
| Displays & video | Output arrangement, mode, scale, variable refresh, and brightness |
| Network | Wi-Fi state, connections, and saved profiles |
| Bluetooth | Adapter state, discovery, pairing, and connected devices |
| Power | Idle display-off behavior and available performance profiles |
| Developer | Flutter shell runtime and live-development controls |

Shell preferences are stored in:

```text
~/.config/denial/settings.json
```

The file is versioned and managed by the shell. Settings is the preferred way
to change it.

## Output configuration

At first login, the packaged output template is copied to:

```text
~/.config/denial/outputs.conf
```

Existing user files are never replaced. With no connector-specific entries,
Denial discovers connected displays, arranges them automatically, and chooses
the fastest mode at each display's native resolution.

Use this command to find connector names and active modes:

```sh
denialctl outputs
```

A small fixed layout might look like:

```ini
eDP-1=0,0,120
DP-1=2560,0,144
scale=DP-1,1.25
vrr=DP-1
system_bar=top,32,eDP-1
maximize_padding=10
```

Supported entries are:

| Entry | Meaning |
| --- | --- |
| `NAME=X,Y` | Place an output in logical desktop coordinates |
| `NAME=X,Y,HZ` | Place it and request a refresh rate |
| `mode=NAME,WIDTH,HEIGHT,MILLIHZ` | Select an exact output mode |
| `scale=NAME,SCALE` | Set fractional or integer scale |
| `vrr=NAME` | Enable variable refresh rate |
| `disabled=NAME` | Keep a connected output disabled |
| `system_bar=EDGE,SIZE[,OUTPUT]` | Place the system bar |
| `system_bar=hidden` | Hide the system bar |
| `maximize_padding=PIXELS` | Reserve space around maximized windows |

`EDGE` can be `top`, `bottom`, `left`, or `right`. Several bar outputs can be
joined with `+`, for example `eDP-1+DP-1`.

For routine changes, use Settings so Denial can validate and persist the full
layout. Manual file edits take effect when the next session starts.

## Machine-level overrides

Administrator overrides belong in:

```text
/etc/denial/session.conf
```

The launcher normally selects the connected boot GPU. Set
`DENIAL_DRM_DEVICE` only when display connectors are routed through another
DRM device:

```ini
DENIAL_DRM_DEVICE=/dev/dri/by-path/pci-0000:01:00.0-card
```

The same file can override the Flutter bundle or user output-config path and
can enable native debug logging. Keep personal desktop preferences in
Settings rather than in this machine-level file.
