---
title: Architecture
weight: 70
prev: control-and-recovery
next: development
---

Flutter is not a client window or an overlay in Denial. The engine is embedded
through its native Embedder API, and the AOT-compiled Dart shell runs inside
`deniald`. Rust and Flutter cooperate on one logical desktop scene while
native resources remain on the Rust side.

## Runtime boundaries

Rust, Smithay, and the in-tree Volition presenter own:

- the Wayland display, protocol state, Xwayland, and client buffers;
- input devices, focus, grabs, native shortcuts, text input, and tablet events;
- display validation, DRM devices, GBM/EGL resources, atomic KMS presentation,
  and page flips;
- persistent settings, display/session authority, native audio and brightness
  controls, and native resource lifetimes.

The embedded Dart shell owns:

- window layout and visible desktop policy;
- the launcher, dashboard, overview, bar, shade, notifications, and lock
  screen;
- animation, gesture behaviour, and shell interaction regions;
- desktop service clients for networking, Bluetooth, media, battery, and power
  profiles;
- composition of application textures and shell UI into the desktop scene.

`denial-settings` is a separate Flutter Wayland application. It communicates
with `deniald` over the versioned control socket, so its rendering work is
isolated from the embedded shell and the compositor remains authoritative for
validation and persistence. `denial-portal` exposes the committed colour
scheme and accent through the standard desktop Settings portal.

## Frame path

Wayland client buffers stay native and are imported as Flutter external
textures. Dart builds one logical scene spanning every output. Denial's
Flutter fork projects the relevant part of that retained scene into a
compositor-owned framebuffer from each physical output's own pool:

```text
Wayland clients ──> Rust / Smithay ──> external textures ──> logical Flutter scene
      input  <──── native routing  <──── shell hit regions <───────────┘
                                                                    │
Display A <── Volition / atomic KMS <── native fence <── output A pool
Display B <── Volition / atomic KMS <── native fence <── output B pool
```

There is no shared scanout atlas in the normal Flutter path. Each output has a
rotating three-buffer pool at that connector's physical mode size. The
embedder's `FlutterCompositor` backing-store callbacks lend an authorized
framebuffer to Flutter and return the completed buffer, damage, and native GPU
fence to Rust. A buffer cannot be rendered into while KMS still owns it.

Denial assembles the current output buffers into a temporary desktop atlas
when a screenshot or whole-desktop screencopy needs one unified image. That
capture representation is not used for normal scanout.

## Independent output clocks

KMS page flips are the frame clocks. Each output can request and present a
successor on its own refresh timeline; a slow or exhausted pool applies
backpressure to that output instead of inventing a global raster lock.
External-texture changes are tracked by output membership, and Flutter only
renders outputs authorized for the current transaction.

Hotplug does not define the lifetime of the Wayland session. If every output
disconnects, clients and compositor state remain alive; reconnecting an output
rebuilds the display path and makes the session visible again.

Partial damage is preserved separately for each rotating buffer. Wayland
frame callbacks and presentation feedback follow the output that actually
displayed the surface. Screen capture also advances from the selected output's
real frame cycle rather than spinning the event loop.

## Logical coordinates and scaling

Desktop, output, window, input, and structured cursor coordinates stay
logical. Flutter receives one logical desktop at the largest active output
scale, while each output projection maps its logical rectangle into that
connector's native pixel size and transform. Lower-scale outputs are sampled
into their own physical targets; Denial does not upscale a finished
desktop-wide scanout image.

Native Wayland surfaces receive the exact preferred fractional scale for the
output that owns them. Xwayland uses one session-wide scale based on the
largest active output because one X server cannot independently scale windows
per monitor. Exact fractional scaling is the default; setting
`DENIAL_XWAYLAND_SCALE_MODE=integer` rounds that session scale upward for
applications that behave better with the compatibility mode.

Cursor size is defined in physical pixels. Client-provided Wayland and X11
cursor surfaces, output transforms, fractional scaling, and cursor frame
callbacks are translated at the native boundary before Flutter paints the
software cursor.

## Impeller at the compositor boundary

Impeller GLES is Denial's default Flutter renderer. The locked Flutter and
Skia forks integrate Impeller with compositor-owned output backing stores
rather than a window supplied by another desktop. They handle exact FBO
selection, frames with no available target, existing-buffer damage, external
texture lifetime, native fences, packed depth/stencil storage, and desktop
backdrop effects.

Skia/Ganesh remains compiled into the same pinned engine generation as a
compatibility fallback. Select it with the packaged
`DENIAL_FLUTTER_RENDERER=skia` session override; it does not require another
engine package.

## Input and surface ownership

Physical events enter through Smithay's libinput backend. Rust first resolves
native shortcuts, pointer constraints, focus, move/resize grabs, and the
Wayland surface tree. Dart publishes bounded shell hit regions and window
content rectangles, allowing native routing to decide whether an event belongs
to shell UI or an application without transferring native handles.

The protocol covers relative and absolute pointer input, touch, keyboard and
text-input state, the built-in keyboard and external input-method path, client
cursor surfaces, output membership, surface transforms, alpha modifiers, and
tablet-v2 data. Direct-touch window gestures are recognized at the native
surface boundary, so they continue to work even when an application does not
understand Denial shell gestures.

## Protocols and trust

The compositor and embedded shell communicate through a bounded, versioned
FlatBuffers protocol. Dart receives immutable metadata and numeric resource
identities; it does not own file descriptors, Wayland objects, EGL images, or
KMS buffers, and embedded Dart never starts helper processes. Flutter
publishes validated actions and interaction geometry back to Rust.

External clients use a separate versioned Unix control socket. The compositor
validates requests, checks document revisions to prevent lost settings
updates, and queues accepted work on its event loop. Live display changes are
native transactions: the previous DRM and Flutter state remains available for
the ten-second confirmation rollback.

## Bundle compatibility and custom shells

`deniald`, its Flutter engine, and its compiled shell are one tested
generation. A replacement bundle must match the native protocol and engine
ABI. Custom shells should import the supported
`package:denial_dart_shell/denial.dart` boundary and start with
`runDenialShell`; code outside the package should not import `lib/src`.

An alternative shell supplies its mobile and desktop feature scenes while
Denial retains lifecycle, theme, localization, secure lock, input publication,
cursor, software keyboard, screenshot selection, and overlay ordering. It is
still trusted session code with access to every native capability exposed to
the official shell. Keep `denialctl ui restore` available while developing
one.

Each physical scanout target is limited to 16,384 pixels on either axis, and
the aggregate allocation for all active output pools is limited to 1 GiB.
Unsupported modes fail explicitly instead of being silently cropped.
