---
title: Development
weight: 80
prev: architecture
---

The source tree contains a Rust compositor in `compositor/` and a Flutter
shell in `dart_shell/`. They are built and versioned together.

## Build from source

Denial supports source builds on x86-64 and ARM64. The commands and output
paths below describe the current turnkey x86-64 reference build on an Arch
development host. ARM64 uses the same locked Denial, Flutter, and Skia sources
with an architecture-matched Flutter engine and shell bundle; first-party
ARM64 packages are not published yet.

Bootstrap the pinned toolchain and Rust dependencies once:

```sh
tools/denial-pc bootstrap
```

Then inspect the host, build both components, and run their test suites:

```sh
tools/denial-pc doctor
tools/denial-pc build
tools/denial-pc test
```

The main x86-64 reference outputs are:

| Artifact | Location |
| --- | --- |
| Compositor | `$XDG_CACHE_HOME/denial/pc-build/rust/release/deniald` |
| Native control client | `$XDG_CACHE_HOME/denial/pc-build/rust/release/denialctl` |
| Flutter release bundle | `dart_shell/build/linux/x64/release/bundle` |

The bootstrap is networked. Later builds reuse the pinned cache. Run
`tools/denial-pc doctor` rather than guessing which Smithay, DRM, GBM, EGL,
libinput, udev, or Xwayland development dependency is missing.

## Test a local session

Install a separate development session entry:

```sh
tools/denial-pc install-session
```

Log out and select that entry explicitly. Remove it when it is no longer
needed:

```sh
tools/denial-pc remove-session
```

The development entry is separate from the packaged Denial session and does
not replace a running compositor.

## Live-edit the Flutter shell

Live editing is optional and does not require rebuilding the Rust compositor.
Install the version-matched development environment:

```sh
sudo pacman -S denial-ui-development
denialctl ui setup
```

The default setup:

1. creates `~/DenialUI` at the source revision recorded by the package;
2. prepares the matching JIT bundle with the packaged toolchain;
3. selects `~/DenialUI/dart_shell` as the workspace;
4. replaces the optimized shell with the live runtime.

Pass another absolute destination to `denialctl ui setup` if preferred.

Open the created `dart_shell` directory in VSCodium and start **Attach to
Denial live UI**. Saving a changed Dart file requests hot reload, and Flutter
Inspector remains available.

This attach profile deliberately does not support debugger pause, breakpoints,
stepping, or expression evaluation: suspending the shell isolate would also
suspend the interactive desktop. Changes to native Rust code or the Flutter
engine still require a normal build and session restart.

## Profile the Flutter shell

For representative performance measurements, build and activate the optimized
AOT profile shell from a Denial checkout:

```sh
denial-ui prepare-profile /absolute/path/to/denial/dart_shell
denialctl ui workspace /absolute/path/to/denial/dart_shell
denialctl ui profile
```

This keeps optimized AOT application code while enabling Flutter's VM service,
timeline events, CPU profiling, and DevTools. It is distinct from the JIT live
editing mode above.

Start browser DevTools with:

```sh
denial-ui attach-profile /absolute/path/to/denial/dart_shell
```

Keep that command running while profiling. Return to the packaged release
shell afterward with:

```sh
denialctl ui restore
```

After installing or replacing `denial-ui-development`, restart the Denial
session once before activating profile mode so the matching native engine is
loaded cleanly.

## Runtime control

Useful development commands are:

```sh
denialctl ui status
denialctl ui setup [PATH]
denialctl ui workspace /absolute/path/to/dart_shell
denialctl ui live on
denialctl ui reload
denialctl ui restart
denialctl ui profile
denialctl ui restore
```

Some reserved actions may report that their native capability is not yet
implemented. A rejected command returns a clear error rather than pretending
to succeed.

Always keep the recovery command available:

```sh
denialctl ui restore
```

It returns to the packaged optimized shell without ending the Wayland session.

> [!CAUTION]
> A custom Flutter shell is trusted session code. It can observe compositor
> state and call every native action exposed to the official shell. Do not run
> untrusted shell sources.
