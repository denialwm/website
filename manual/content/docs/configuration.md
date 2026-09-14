---
title: Settings and displays
weight: 30
prev: using-denial
next: system-services
---

Denial Settings is a standalone Flutter Wayland application. It sends typed
requests over the private control socket; `deniald` validates hardware and
persistent state and remains the sole authority that writes configuration.
Most changes apply to the running session.

## Settings pages

| Page | What it controls |
| --- | --- |
| Appearance | Dark, light, or no-preference colour scheme; wallpaper or custom accent; cursor theme and physical size; shape, glass, opacity, blur, and focused-window treatment |
| Language | Live shell and Settings language |
| Keyboard | XKB layouts, variants, options, repeat delay, and repeat rate |
| Mouse & touchpad | Pointer and finger-scroll speed, tap to click, and natural scrolling; shown when suitable hardware exists |
| Shortcuts | Compositor actions, applications, programs, shell commands, and touchpad gestures |
| App environment | Default and per-desktop-entry variables for applications Denial launches |
| Animations | Animation speed, panel motion, lock motion, and close effect |
| Desktop layout | Stacking, tiling, or scrolling layout; monitor-local workspaces; system bar; ordinary and maximized spacing |
| Overlays | Launcher, dashboard, notification, and system-HUD placement and size |
| Lock screen | Wallpaper, dimming, blur, clock scale, status visibility, and notification privacy |
| Fingerprint | Enrollment for the session user; shown when fprintd reports a device |
| Audio | Default output selection, volume, mute, and application streams |
| Displays & video | Primary display, arrangement, mode, refresh, rotation, scale, VRR, and brightness |
| Network | Wi-Fi state, scanning, connections, and saved profiles |
| Bluetooth | Adapter state, discovery, pairing, trust, and connected devices |
| Power | Idle lock, display-off and suspend policy, suspend mode, power profiles, battery information, and supported charge limits |
| Developer | Flutter shell workspace, runtime, and live-development controls |
| About | Project identity and credits |

Preferences live in:

```text
$XDG_CONFIG_HOME/denial/settings.json
```

or `~/.config/denial/settings.json` when `XDG_CONFIG_HOME` is unset. The file
is versioned, migrated, revision-checked, and atomically replaced with mode
`0600` by `deniald`. Use Settings instead of editing it while Denial is
running; concurrent external changes are rejected instead of overwriting a
newer revision.

Keyboard and shortcut candidates are compiled or validated before they become
live. A failed update leaves both the active state and saved file unchanged.
Shortcut bindings are stored separately in
`~/.config/denial/shortcuts.json` and are migrated as defaults evolve.

## Live display configuration

Open **Settings → Displays & video** to:

- drag monitors into logical desktop positions;
- select the primary display, or let Denial choose the enabled output with the
  highest refresh rate;
- select resolution and refresh rate;
- set a 50–600% scale from the UI, including fractional values;
- rotate a display by 90°, 180°, or 270°;
- enable VRR when the connector supports adaptive sync; and
- control brightness through an associated kernel backlight or DDC/CI display.

Denial submits the complete output state as one transaction, validates it with
DRM/KMS before replacing live state, and presents a ten-second confirmation.
Choose **Keep changes** to persist it or **Revert now** to roll back. If the
dialog is not confirmed, the previous configuration is restored automatically.
Failed renderer replacement or modesetting also returns to the retained
working output and Flutter resources.

Display changes are persisted to:

```text
$XDG_CONFIG_HOME/denial/outputs.conf
```

The packaged template is copied on first login and an existing user file is
never replaced. Settings rewrites only its connector directives and preserves
unrelated comments and shell-layout entries. If persistence is unavailable,
Settings clearly labels the change as session-only.

### Manual output file

With no connector entries, Denial discovers displays, arranges them from left
to right, and selects the fastest mode at each native resolution. Inspect the
authoritative live state with:

```sh
denialctl outputs
```

A manual layout can contain:

```ini
primary=eDP-1
eDP-1=0,0
mode=eDP-1,2560,1600,120000
scale=eDP-1,1.5
DP-1=1707,0
mode=DP-1,3840,2160,144000
transform=DP-1,90
vrr=DP-1
disabled=HDMI-A-1
system_bar=top,32,eDP-1+DP-1
maximize_padding=10
```

| Entry | Meaning |
| --- | --- |
| `NAME=X,Y` | Place an output in logical desktop coordinates |
| `NAME=X,Y,HZ` | Legacy shorthand that also requests refresh at native resolution |
| `primary=NAME` | Choose the primary display |
| `mode=NAME,WIDTH,HEIGHT,MILLIHZ` | Select an exact mode; small refresh values are accepted as hertz |
| `scale=NAME,SCALE` | Set fractional or integer scale |
| `transform=NAME,VALUE` | Use `normal`, `90`, `180`, `270`, or a `flipped-*` variant |
| `vrr=NAME` | Enable variable refresh rate |
| `disabled=NAME` | Keep a connected output outside the KMS and Wayland topology |
| `system_bar=EDGE,SIZE[,OUTPUTS]` | Place the bar; join several outputs with `+` |
| `system_bar=hidden` | Hide the system bar |
| `maximize_padding=PIXELS` | Reserve space around maximized windows |

Prefer the transactional Settings UI. If manual edits prevent a usable login,
follow [Recover an output layout](/docs/control-and-recovery/#recover-an-output-layout).

When `iio-sensor-proxy` exposes an accelerometer, Denial can automatically
rotate built-in `DSI-*`, `eDP-*`, and `LVDS-*` panels. The configured transform
describes the fixed mounting orientation; sensor rotation is temporary and is
not written to `outputs.conf`.

### Display scaling

Coordinates and window geometry stay logical. Flutter renders each output at
its physical target resolution, while fractional-scale-aware Wayland clients
receive the exact preferred scale for their current output. Older clients
receive the next integer buffer scale and are downsampled.

Xwayland uses one density for the session because a single X server cannot
give each X11 window a different coordinate scale. Denial now uses the exact
fractional desktop density by default, so DPI-aware X11 applications can render
directly at 125% or 150%. For an application stack that cannot handle
fractional X11 DPI, select the former integer-upscale policy in
`/etc/denial/session.conf` and restart the session:

```ini
DENIAL_XWAYLAND_SCALE_MODE=integer
```

Accepted values are `fractional` and `integer`.

## Appearance and application themes

The colour-scheme preference changes Denial's complete semantic palette. The
resolved scheme and accent are also published through the standard desktop
Settings portal, so portal-aware applications can follow the shell. **No
preference** keeps Denial's dark fallback while allowing applications to make
their own choice.

The launcher defaults Qt applications to the portal-backed theme provider:

```text
QT_QPA_PLATFORMTHEME=xdgdesktopportal
```

An inherited value or an explicit entry in `/etc/denial/session.conf` wins.
Denial does not rewrite KDE configuration or force a widget style.

Cursor selection follows the XCursor theme search path. Appearance can choose
an imported theme and its physical size; animated cursors and client-provided
Wayland cursor surfaces retain their own hotspot and frame timing.

## Application environment and autostart

**Settings → App environment** defines literal variables for all processes
launched by Denial and optional deltas keyed by desktop-file ID. A rule can set
a value, preserve an empty string, or hide an inherited variable. Changes
affect subsequent launcher and shortcut starts without restarting Denial.

Application targets keep their desktop-file identity and receive both default
and per-application rules. Raw Program and Shell command targets receive only
the defaults. These rules do not modify `deniald`, D-Bus activation, systemd
services, or XDG autostart entries.

On systemd-managed sessions, Denial starts the standard
`xdg-desktop-autostart.target` only after the compositor and initial outputs
are ready. Entries can use `OnlyShowIn=Denial;`. On systems without a systemd
user manager, use that system's session-service mechanism; Denial does not run
a second autostart implementation.

## Machine-level overrides

Administrator overrides belong in:

```text
/etc/denial/session.conf
```

The launcher normally chooses the connected boot GPU. Split-GPU machines can
keep display control on one device and rendering on another:

```ini
DENIAL_DRM_DEVICE=/dev/dri/card0
DENIAL_RENDER_DEVICE=/dev/dri/renderD128
```

The file can also override the Flutter bundle, output-config path, Qt platform
theme, Xwayland scale mode, shell profile, and native logging. Canonical Denial
variables use the `DENIAL_*` prefix. Older `DENIA_*` spellings remain temporary
compatibility aliases, and `DENIAL_*` wins when both exist.

### Renderer fallback

Impeller GLES is the default. Select the retained Skia/Ganesh fallback only
for a driver-specific rendering problem:

```ini
DENIAL_FLUTTER_RENDERER=skia
```

Restart the Denial session after changing it. Remove the override or set it to
`impeller` to return to the default. For one controlled launch, use
`denial-session --flutter-renderer skia`.
