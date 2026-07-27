---
title: Control and recovery
weight: 60
prev: screen-capture
next: architecture
---

`denialctl` talks directly to the native compositor. It does not depend on the
Flutter shell being visible or responsive, which makes it suitable for both
inspection and recovery.

## Inspect a session

| Command | Result |
| --- | --- |
| `denialctl status` | Compositor, output, and Flutter runtime summary |
| `denialctl outputs` | Output modes, positions, scale, power state, and configuration serial |
| `denialctl ui status` | Selected UI workspace, runtime mode, progress, and errors |
| `denialctl --json status` | Machine-readable status; `--json` works with every command |

Commands return a nonzero status when an action is rejected or fails.
Diagnostics go to standard error when JSON output is selected.

## Control socket

The client searches for its Unix socket in this order:

1. the path passed with `--socket`;
2. `DENIAL_SOCKET`;
3. `$XDG_RUNTIME_DIR/denial/control.sock`.

A normal session creates the runtime directory with mode `0700` and the socket
with mode `0600`. The socket is private to the session user.

Use `--no-wait` with an action when a script only needs confirmation that the
request was accepted:

```sh
denialctl --no-wait ui restore
```

## Recover the packaged shell

If edited Flutter code leaves the desktop unusable, open a terminal or another
virtual terminal and run:

```sh
denialctl ui restore
```

The native compositor replaces the custom runtime with the packaged optimized
shell without dropping Wayland clients or releasing the displays.

If the compositor itself must be stopped, `Ctrl+Alt+Backspace` ends the
session. Use it only as an emergency exit because applications do not get a
normal save workflow.

## Recover an output layout

Run `denialctl outputs` first. If a manually edited layout prevents a usable
login, stop the Denial session and preserve the file under another name:

```sh
mv ~/.config/denial/outputs.conf ~/.config/denial/outputs.conf.bak
```

At the next login, Denial creates a fresh per-user file from the packaged
template and automatically arranges connected outputs.

## Preflight and logs

From another desktop session:

```sh
denial-session --check
```

For logs from the current boot:

```sh
journalctl --user -b
```

To temporarily increase native logging, add this line to
`/etc/denial/session.conf`, then start a new Denial session:

```ini
DENIAL_RUST_LOG=deniald=debug,smithay=info
```

Remove the override after collecting the needed diagnostics; verbose
compositor logs can grow quickly.
