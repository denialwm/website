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
| `denialctl status` | Flutter runtime generation and active-output summary |
| `denialctl outputs` | Connector, mode, refresh rate, position, scale, power state, and configuration serial |
| `denialctl ui status` | Selected UI workspace, runtime mode, progress, and errors |
| `denialctl --json status` | Machine-readable status; `--json` works with every command |

Commands return a nonzero status when an action is rejected or fails.
Diagnostics go to standard error when JSON output is selected. `denialctl`
only inspects outputs; use the standalone Settings application to arrange
displays, choose modes and scaling, or enable adaptive sync. Display changes
are tested live and automatically roll back unless confirmed within ten
seconds.

## Control socket

The client searches for its Unix socket in this order:

1. the path passed with `--socket`;
2. `DENIAL_SOCKET`;
3. `$XDG_RUNTIME_DIR/denial/control.sock`.

A normal session creates the runtime directory with mode `0700` and the socket
with mode `0600`. The socket is private to the session user.

Use `--no-wait` with a runtime action when a script only needs confirmation
that the request was accepted:

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
shell without dropping Wayland clients or releasing the displays. If the last
custom bundle was working, `denialctl ui revert` selects it instead.

If the compositor itself must be stopped, `Ctrl+Alt+Backspace` ends the
session. Use it only as an emergency exit because applications do not get a
normal save workflow.

## Recover an output layout

The Displays page has the safest recovery path: an unconfirmed change returns
to the last working configuration after ten seconds. If a manually edited
layout prevents a usable login, stop the Denial session and preserve the file
under another name:

```sh
mv ~/.config/denial/outputs.conf ~/.config/denial/outputs.conf.bak
```

At the next login, the session launcher creates a fresh per-user file from the
packaged template and automatically arranges connected outputs.

## Recover settings and shortcuts

General shell settings are stored in `~/.config/denial/settings.json`. Denial
uses safe in-memory defaults when this file is invalid and leaves the bad file
untouched for inspection. Stop the session and move it aside to let Denial
create a fresh document:

```sh
mv ~/.config/denial/settings.json ~/.config/denial/settings.json.bak
```

Native shortcuts live in `~/.config/denial/shortcuts.json`. If that file
cannot be parsed or validated at startup, Denial automatically renames it to a
`shortcuts.invalid-*.json` backup and restores the defaults.

## Preflight and logs

Run the same checks used by the graphical session before logging into it:

```sh
denial-session --check
```

The report resolves the compositor, control client, Flutter bundle, output
configuration, display and render devices, shell profile, Flutter renderer,
Xwayland scale mode, Qt platform theme, and Xwayland binary. A failed line is
normally more useful than trying to start a partial session.

On a systemd user session, inspect the current boot:

```sh
journalctl --user -b
```

On a non-systemd installation, consult the display manager or session
launcher's log instead. To temporarily increase native logging, add this line
to `/etc/denial/session.conf`, then start a new Denial session:

```ini
DENIAL_RUST_LOG=deniald=debug,smithay=info
```

Remove the override after collecting the needed diagnostics; verbose
compositor logs can grow quickly.
