---
title: Getting started
prev: /docs
next: architecture
---

Denial currently targets **Arch Linux on x86-64**. It already runs as a
complete Wayland session with Xwayland, multi-output, native input, direct
screenshots, and portal screen sharing.

> [!WARNING]
> Denial is under active development. Expect interfaces and configuration to
> evolve, and keep another desktop session available while experimenting.

## Install on Arch Linux

Signed first-party packages are published for Arch x86-64. Add the Denial
repository by following the
[current installation guide](https://github.com/denialwm/denial/blob/main/docs/packaging/arch/INSTALL.md),
then install or update Denial with:

```sh
sudo pacman -Syu denial
```

The repository signing key has fingerprint:

```text
AE4108FA5E91E26BE0EE331E0F5B3AD16E023091
```

Always compare that value with the current project documentation before
trusting the key.

## Build from source

The source tree contains two versioned parts: the Rust compositor in
`compositor/` and the embedded Flutter shell bundle in `dart_shell/`.
The project tool downloads the pinned dependencies, checks prerequisites,
builds both parts, and runs their tests.

See the [building guide](https://github.com/denialwm/denial/blob/main/docs/BUILDING.md)
for host dependencies and the exact workflow.

## Find your way around

- [`denialctl` reference](https://github.com/denialwm/denial/blob/main/docs/DENIALCTL.md)
- [Flutter shell development](https://github.com/denialwm/denial/blob/main/docs/UI_DEVELOPMENT.md)
- [Issue tracker](https://github.com/denialwm/denial/issues)
- [Latest releases](https://github.com/denialwm/denial/releases)
