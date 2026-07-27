---
title: Architecture
prev: getting-started
---

Flutter is not an overlay placed on top of another compositor in Denial. The
engine is embedded through its native Embedder API, and the AOT-compiled Dart
shell runs inside the compositor process.

## The native compositor

Rust and Smithay own the state that must remain native:

- Wayland protocols and client buffers
- input devices, focus, and grabs
- output configuration
- DRM/KMS presentation
- native resource lifetimes

## The Flutter shell

Flutter owns the visible desktop policy:

- shell layout and application windows
- system surfaces and settings
- motion and gestures
- interaction regions

Wayland buffers are imported as external textures into Flutter's scene. Flutter
renders the desktop into a shared GBM atlas, and each display scans out its own
region through KMS.

```text
Wayland clients ──> Rust / Smithay ──> external textures ──> Flutter scene
       input <──── native routing <──── shell hit regions <──────┘

Displays <────────────── DRM / KMS <────────────── shared GBM atlas
```

## A versioned boundary

The native compositor and Flutter shell form a versioned bundle boundary. That
keeps the responsibilities explicit and leaves room for alternative compatible
shells in the future.

For implementation detail, read the
[architecture notes in the source repository](https://github.com/denialwm/denial/blob/main/docs/architecture.md).
