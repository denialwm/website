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
| Displays & video | Connected-output mode, refresh, and scale details, plus brightness |
| Network | Wi-Fi state, connections, and saved profiles |
| Bluetooth | Adapter state, discovery, pairing, and connected devices |
| Power | Idle display-off behavior and available performance profiles |
| Developer | Flutter shell runtime and live-development controls |

In **Appearance**, the minimum window opacity for blur controls when Denial
stops rendering backdrop blur for a nearly transparent window. Raise it to
skip more low-opacity blur work, or lower it to retain blur further through
opacity changes. A fully invisible window never requests backdrop blur.

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

The current Settings page reports each active mode, refresh rate, and scale and
controls brightness; it does not yet edit output placement, mode, scale, or
variable refresh. Change those entries in `outputs.conf` while Denial is not
running. Manual file edits take effect when the next session starts, when
Denial validates the complete layout before applying it.

### Display scaling

An output scale is the ratio between physical display pixels and Denial's
logical desktop coordinates. For example, `1.25` is 125% and `1.5` is 150%.
Output positions, window geometry, system-bar thickness, and maximize padding
remain in logical pixels; Denial renders the desktop at the required physical
resolution instead of enlarging a finished image.

Fractional-scale-aware Wayland applications receive the exact scale of their
current output. Older Wayland applications receive the next integer scale and
are downsampled, which favors sharp content over enlarging a 1x buffer.

Xwayland uses one scale for the whole session because one X server cannot give
each X11 window a different coordinate scale. Denial chooses the next integer
at or above the largest active output scale and publishes matching X11 DPI
hints. On a 1.5x desktop, for example, DPI-aware X11 applications render at 2x
and are downsampled to 1.5x. Applications that ignore X11 DPI hints may appear
smaller than expected, especially in a mixed-scale layout.

> [!WARNING]
> Display scaling is an initial implementation. The 1.5x path has been
> exercised; 1x, mixed-scale layouts, moving windows between differently
> scaled outputs, and changing scale at runtime still need broader validation.
> Run `denialctl outputs` after a change to confirm the active logical layout
> and scale.

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

### Renderer fallback

Denial uses its compositor-integrated Impeller GLES path by default. If a
specific GPU or driver has a rendering issue, select the retained Skia/Ganesh
fallback in `/etc/denial/session.conf`:

```ini
DENIA_FLUTTER_RENDERER=skia
```

Restart the Denial session after changing the renderer. Remove the override—or
set it to `impeller`—to return to the default. For one controlled launch, the
equivalent direct argument is `denial-session --flutter-renderer skia`.
