---
title: Mobile and tablets
weight: 25
prev: using-denial
next: configuration
---

This page collects what Denial already documents for the mobile shell, direct
touch, and the system services that shell can use. Public packages still
target x86-64 PCs. Mobile deployments currently use architecture-matched
source builds.

## Touch on a window

On an ordinary window, direct touch reserves a compositor gesture vocabulary:

- Dragging from the top 48 logical pixels moves the window.
- Pinching resizes it around its center.
- A two-finger downward swipe from the top strip minimizes it.
- Three simultaneous contacts close it.

Once a gesture is recognized, Denial cancels the application's previous touch
sequence. Those gestures are recognized at the native surface boundary, so
they continue to work when an application does not understand Denial shell
gestures. Touch, keyboard, and text-input state, including the built-in
keyboard, are part of the compositor protocol.

## Mobile shell

The explicitly selected mobile shell adds:

- a paged home grid
- app recents
- notification history
- quick settings
- a status bar
- mobile wallpaper controls
- an on-screen keyboard
- rotation controls
- edge gestures

Settings opens from the mobile home screen as a normal Denial-managed Wayland
window. On the mobile shell, the Screenshot quick setting captures the full
desktop without opening the region selector.

Cellular status, mobile data, SIM PIN handling, fingerprint presentation,
wake gestures, and haptic feedback appear only when the corresponding hardware
and system services are available.

## System services the shell can use

Denial uses the host's existing services. Optional integrations disappear or
become read-only when the service or hardware is missing.

With NetworkManager and ModemManager, the mobile shell shows cellular
registration, measured signal quality, and whether a data bearer is connected.
The Mobile data tile changes NetworkManager's global WWAN state. It does not
create an APN or carrier profile. A primary SIM PIN prompt accepts 4–8 digits
and reports remaining attempts. Unlocking the SIM never authenticates the
Denial session, and device authentication does not dismiss a blocking SIM
prompt. PUK recovery and multi-SIM management remain outside this interface.

If fprintd reports a reader and an enrolled finger, verification starts
automatically whenever the native session gate is locked, including a
`--start-locked` session. Password unlock remains available. The Fingerprint
Settings page appears only when a reader is present, and it asks for the
user's sudo password before listing or enrolling fingers.

`iio-sensor-proxy` provides automatic rotation for built-in panels.
`hapticd` can provide optional bounded tap and fingerprint-rejection feedback.

## Custom shells

An alternative shell supplies its mobile and desktop feature scenes. Denial
retains lifecycle, theme, localization, secure lock, input publication,
cursor, software keyboard, screenshot selection, and overlay ordering. The
public entry point is `runDenialShell`, with separate `mobile` and `desktop`
scenes.

## Where this is documented

- [Using Denial]({{< relref "/docs/using-denial" >}}#touch-and-mobile-shell)
- [System services]({{< relref "/docs/system-services" >}})
- [Settings and displays]({{< relref "/docs/configuration" >}})
- [Screenshots and screen sharing]({{< relref "/docs/screen-capture" >}})
- [Architecture]({{< relref "/docs/architecture" >}}#input-and-surface-ownership)
- [Development]({{< relref "/docs/development" >}}#build-a-custom-shell)
