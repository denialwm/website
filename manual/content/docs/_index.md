---
title: Manual
next: getting-started
---

Denial is a Flutter-native Wayland compositor under active development. This
manual covers the concepts and entry points that are stable enough to be
useful today; low-level development notes remain alongside the source.

{{< cards >}}
  {{< card link="getting-started" title="Getting started" subtitle="Project status, supported target, and installation paths." icon="play" >}}
  {{< card link="architecture" title="Architecture" subtitle="The boundary between Rust, Smithay, and the embedded Flutter shell." icon="cube" >}}
{{< /cards >}}

## Detailed guides

The repository currently carries the most detailed, version-matched guides:

- [Build Denial from source](https://github.com/denialwm/denial/blob/main/docs/BUILDING.md)
- [Install on Arch Linux](https://github.com/denialwm/denial/blob/main/docs/packaging/arch/INSTALL.md)
- [Use `denialctl`](https://github.com/denialwm/denial/blob/main/docs/DENIALCTL.md)
- [Develop the Flutter shell](https://github.com/denialwm/denial/blob/main/docs/UI_DEVELOPMENT.md)
- [Screen capture and portals](https://github.com/denialwm/denial/blob/main/docs/SCREEN_CAPTURE.md)

> [!NOTE]
> APIs, the native/shell bundle boundary, and the wire protocol may change
> while Denial is in active development.
