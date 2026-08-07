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

### Logical and physical scale

Desktop, output, window, and structured cursor coordinates remain logical.
The shared atlas is allocated at physical resolution using the largest active
output scale, and Flutter receives that same value as its device-pixel ratio.
The shell therefore lays out one logical desktop while rasterizing it sharply
at the atlas resolution; Denial does not scale up Flutter's finished image.

Native Wayland surfaces receive the exact preferred scale of the output that
currently owns them. Xwayland instead uses the integer ceiling of the largest
output scale as one session-wide scale, with matching DPI hints, because a
single X server cannot independently scale windows for different outputs.

## Impeller at the compositor boundary

Impeller GLES is Denial's default Flutter renderer. This required more than
enabling Flutter's application-level Impeller switch: Denial renders into a
rotating pool of compositor-owned GBM framebuffers, not a window supplied by
another desktop. The locked Denial Flutter fork integrates Impeller directly
with that atlas path.

The integration presents the exact FBO selected by the Rust host, safely
completes frames when no atlas target is available, preserves partial damage
across rotating buffers, and keeps imported Wayland textures alive through the
native GPU fence. Packed depth/stencil storage and backdrop-filter behavior are
also handled for the compositor-owned targets.

The result is one Impeller-rendered scene that proceeds directly from Flutter
to the KMS scanout atlas. Skia/Ganesh remains compiled into the same pinned
engine generation as a compatibility fallback; it does not require a separate
engine package.

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
