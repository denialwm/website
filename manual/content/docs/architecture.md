---
title: Architecture
weight: 70
prev: control-and-recovery
next: development
---

Flutter is not a client window or an overlay in Denial. The engine is embedded
through its native Embedder API, and the Dart shell runs inside `deniald`.
Rust and Flutter cooperate on one desktop scene while keeping native resources
on the Rust side.

## Responsibilities

Rust and Smithay own:

- the Wayland display, protocols, Xwayland, and client buffers;
- input devices, focus, grabs, and native shortcuts;
- DRM devices, output validation, KMS presentation, and page flips;
- file descriptors and native Wayland, EGL, GBM, and KMS lifetimes.

Flutter owns:

- window layout and visible desktop policy;
- the launcher, dashboard, overview, bar, settings, and lock screen;
- animation, gesture behavior, and shell hit regions;
- the composition of application textures into the desktop.

This division lets the shell change quickly without moving unsafe handles or
privileged display operations into Dart.

## Frame path

Wayland client buffers are imported as external textures. Flutter composes
those textures with the shell UI into a desktop-wide XRGB8888 GBM atlas. Each
physical output scans its assigned rectangle from that atlas through KMS.

```text
Wayland clients ──> Rust / Smithay ──> external textures ──> Flutter scene
      input  <──── native routing  <──── shell hit regions <──────┘

Displays <────────────── DRM / KMS <────────────── shared GBM atlas
```

Presentation is tied to the real output frame cycle. Capture requests and
continuous recording therefore advance with the selected output instead of
spinning the event loop.

## Native-shell protocol

The compositor and shell communicate through a bounded, versioned FlatBuffers
protocol. Dart receives immutable metadata and numeric resource identities; it
does not own file descriptors or native handles and does not start helper
processes.

Flutter publishes interaction regions back to Rust. Native input routing can
then decide whether an event belongs to the shell, a Wayland surface, a move
or resize grab, or a compositor shortcut.

External tools use a separate versioned Unix control socket. The compositor
validates each request and queues accepted work onto its event loop.

## Bundle compatibility

`denial`, its Flutter engine, and its compiled shell are a tested generation.
The Arch package requires the exact compatible engine package. A replacement
shell must speak the matching native protocol and should be treated as trusted
session code.

The current atlas implementation rejects a desktop axis larger than 16,384
pixels or a buffer pool larger than 1 GiB. Unsupported layouts fail explicitly
instead of being silently cropped.
