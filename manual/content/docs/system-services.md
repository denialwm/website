---
title: System services
weight: 40
prev: configuration
next: screen-capture
---

Denial talks to standard Linux desktop services instead of maintaining
separate device databases. A missing service disables its related controls
without changing the rest of the desktop.

## Supported integrations

| Feature | Service or interface | Denial support |
| --- | --- | --- |
| Desktop audio | PulseAudio protocol | Default-output volume and mute, hardware keys, and per-application streams |
| Networking | NetworkManager | Wi-Fi radio, scanning, status, connect, disconnect, and saved profiles |
| Bluetooth | BlueZ | Discovery, pairing, trust, connect, disconnect, and device removal |
| Media controls | MPRIS | Metadata and previous, play or pause, and next actions |
| Session power | `systemd-logind` | Suspend, hibernate, reboot, power off, and inhibitor handling |
| Power profiles | `power-profiles-daemon` | Power saver, balanced, and performance profiles when offered |
| AMD tuning | LACT | Optional low, automatic, and high performance presets |
| Screen sharing | PipeWire and desktop portals | Monitor capture for browsers, OBS, and sandboxed applications |

## Audio

Denial is a native PulseAudio-protocol client. It works with:

- PipeWire through `pipewire-pulse`;
- a PulseAudio server;
- another server that provides a compatible PulseAudio socket.

The dashboard and Audio settings control the default output and individual
application playback streams. The hardware volume keys use the same native
connection, so they continue to work independently of application focus.

If audio controls are unavailable on a typical PipeWire desktop, make sure
the compatibility service is installed:

```sh
sudo pacman -S pipewire-pulse
```

## Network

The Network page requires NetworkManager on the system bus. Denial can create
and use Wi-Fi profiles for:

- open networks;
- WEP;
- WPA or WPA2 Personal;
- WPA3 Personal;
- OWE, also called Enhanced Open.

Enterprise Wi-Fi is supported through an existing NetworkManager profile.
Create credentials for that profile with NetworkManager tooling first, then
select the saved connection in Denial. Denial does not currently create new
enterprise profiles.

NetworkManager may ask polkit for permission to change system connections.
Without that permission, status remains visible but some actions are disabled.

To install and start NetworkManager on Arch:

```sh
sudo pacman -S networkmanager
sudo systemctl enable --now NetworkManager
```

## Bluetooth

Bluetooth uses BlueZ. Denial can power an adapter, scan, pair, confirm or enter
a passkey, trust a device, connect, disconnect, and remove it. A PIN or
passkey is passed to BlueZ for the pairing exchange and is not retained by
Denial.

If no adapter appears, first check that the BlueZ service is running:

```sh
sudo pacman -S bluez
sudo systemctl enable --now bluetooth
```

## Power and hardware status

Logout and machine power actions go through `systemd-logind` and honor active
inhibitors. Optional `power-profiles-daemon` integration exposes the profiles
supported by the machine.

LACT can provide performance presets for the first supported AMD GPU through
its local daemon socket. Denial remains usable when LACT is absent.

The system bar reads CPU activity from the kernel, battery state from the
system, AMD GPU load from sysfs, and NVIDIA load through NVML when available.
Unsupported sensors are simply omitted rather than treated as errors.
