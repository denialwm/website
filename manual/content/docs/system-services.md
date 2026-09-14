---
title: System services
weight: 40
prev: configuration
next: screen-capture
---

Denial uses standard Linux services and protocols instead of maintaining
parallel device databases. Optional integrations disappear or become read-only
when their service or hardware is unavailable; the compositor continues to
run.

## Integration map

| Feature | Service or interface | Denial support |
| --- | --- | --- |
| Desktop audio | PulseAudio protocol | Output selection, volume and mute, hardware keys, and per-application streams |
| Wi-Fi | NetworkManager or iwd | Radio state, scanning, connectivity, connect, disconnect, forget, and saved profiles |
| Cellular | NetworkManager and ModemManager | Registration and signal status, bearer state, mobile-data toggle, and primary SIM PIN prompt |
| Bluetooth | BlueZ | Discovery, pairing agent, passkeys, trust, connect, disconnect, and removal |
| Battery | UPower | Charge state, health and energy details, time estimates, and supported charge-threshold toggle |
| Brightness | Kernel backlight and DDC/CI | Per-output reading and control |
| Media | MPRIS | Metadata, artwork, and transport controls |
| Tray | StatusNotifier/AppIndicator and XEmbed | Icons, application menus, and pointer actions |
| Session power | logind-compatible service | Suspend, hibernate, reboot, power off, authorization, and inhibitors |
| Power profiles | power-profiles-daemon | Power saver, balanced, and performance profiles when available |
| AMD tuning | LACT | Optional low, automatic, and high performance presets |
| Authentication | PAM and optional fprintd | Password unlock, automatic fingerprint verification, and enrollment |
| Orientation | iio-sensor-proxy | Automatic rotation for built-in panels |
| Haptics | hapticd | Optional bounded tap and fingerprint-rejection feedback |
| Appearance | Denial Settings portal | Standard colour-scheme and accent-color values for applications |
| Capture | wlr screencopy, PipeWire, and portals | Direct screenshots/recording and monitor sharing |

## Audio

Denial is a native PulseAudio-protocol client. It works with PipeWire through
`pipewire-pulse`, a PulseAudio server, or another compatible socket. The
dashboard can choose the default output, while Audio settings controls master
volume and individual playback streams. Hardware volume keys use the same
native connection and do not depend on application focus.

On a typical PipeWire Arch system:

```sh
sudo pacman -S pipewire-pulse
```

## Wi-Fi and cellular

Denial prefers NetworkManager when both supported Wi-Fi backends are running,
because NetworkManager may itself use iwd. When NetworkManager is absent it can
talk directly to iwd instead. Both backends expose the same shell UI and react
to service restarts.

New profiles can be created for open, WEP, WPA/WPA2 Personal, WPA3 Personal,
and OWE networks. Enterprise Wi-Fi can use an existing profile, but Denial does
not create new enterprise credentials. NetworkManager and iwd keep ownership
of secrets and saved connections; system D-Bus and polkit policy decide which
changes are authorized.

With NetworkManager and ModemManager available, the mobile shell shows
cellular registration, measured signal quality, and whether a data bearer is
connected. The Mobile data tile changes NetworkManager's global WWAN state; it
does not create an APN or carrier profile. A primary SIM PIN prompt accepts
4–8 digits and reports remaining attempts. It is separate from device unlock:
unlocking the SIM never authenticates the Denial session, and device
authentication does not dismiss a blocking SIM prompt. PUK recovery and
multi-SIM management remain outside this interface.

## Bluetooth

BlueZ provides adapter power, scanning, pairing, trust, and connection state.
Denial registers a pairing agent for confirmation and PIN/passkey exchanges;
entered secrets are sent to BlueZ once and are not retained. Incoming requests
time out or are rejected when no usable pairing surface exists.

On Arch:

```sh
sudo pacman -S bluez
sudo systemctl enable --now bluetooth
```

## Power, battery, and brightness

Logout and machine power requests use the active logind-compatible session and
honor inhibitors and authorization. Denial can schedule independent idle
deadlines for lock, DPMS display-off, and suspend. It also exposes the Linux
suspend modes the system supports (`s2idle`, `shallow`, or `deep`) and applies
the selected mode to Denial-initiated suspend.

UPower supplies battery state, warning level, health, cycles, energy, power
rate, voltage, temperature, and remaining-time estimates when the hardware
publishes them. If UPower supports a charge-threshold or firmware-optimized
charging switch, Settings can enable it; the threshold levels themselves
remain system-provided and read-only. Denial issues low and critical battery
notifications from this state.

Internal displays use an associated kernel backlight. External monitors use
the available libddcutil ABI and DDC/CI VCP controls. Missing or ambiguous
hardware is left unclaimed instead of changing the wrong display.

`power-profiles-daemon` exposes system profiles. LACT can additionally expose
presets for the first supported AMD GPU. Both are optional.

## Fingerprint authentication

If fprintd reports a reader and an enrolled finger, Denial starts verification
automatically whenever the native session gate is locked, including a
`--start-locked` session. A successful match still passes PAM account
validation, wakes Denial-blanked outputs, and resets idle deadlines. Reader
failure or missing enrollment leaves password authentication available.

The Fingerprint Settings page appears only when a reader is present. It asks
for the user's sudo password before listing or enrolling fingers. The helper
accepts only those bounded operations for the current user, never places a
password in process arguments, releases the reader when the page closes, and
expires its authorization after five minutes. On Arch, install `fprintd` and
`sudo` to enable this workflow.

## Session activation, portals, and autostart

After the shell and initial outputs have presented, a systemd user session
publishes the discovered Wayland, X11, and control endpoints and starts
`denial-session.target`. Portals and standard XDG autostart entries therefore
start against valid sockets. D-Bus activation still receives the endpoints on
elogind/non-systemd systems, but XDG autostart needs that system's own session
runner.

`denial-portal` implements the desktop Settings portal for Denial's committed
colour scheme and accent. GTK remains the fallback for portal namespaces
Denial does not implement. ScreenCast and Screenshot route to
`xdg-desktop-portal-wlr`; PipeWire stays outside the compositor process.

## Hardware status

The bar and lock screen read CPU load from the kernel, battery data from UPower
or native power-supply state, AMD GPU activity from sysfs, and NVIDIA activity
through NVML when available. Unsupported sensors are omitted. Tablet tools use
Wayland tablet-v2 with proximity, pressure, distance, tilt, rotation, wheel,
tip, and button events; an explicit libinput output mapping wins, otherwise
the tool follows the output under the pointer for that proximity sequence.
