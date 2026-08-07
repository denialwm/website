---
title: Getting started
weight: 10
prev: /docs
next: using-denial
---

Denial currently supports **Arch Linux on x86-64**. The first-party package
installs the compositor, its matching Flutter engine, the desktop shell,
Xwayland support, a UWSM session, and portal configuration.

> [!WARNING]
> Denial is still a public alpha. Keep another graphical session installed so
> you have a known-good way to update or repair the system.

## Install

The guided installer verifies Denial's full signing-key fingerprint, shows
every planned change, and asks before using `sudo`:

```sh
curl -fsSL https://install.denialwm.org | sh
```

> [!TIP]
> The installer checks the complete Denial release-key fingerprint:
> `AE4108FA5E91E26BE0EE331E0F5B3AD16E023091`.

{{% details title="Manual repository setup" closed="true" %}}

If you do not want to use the installer, download and inspect the public key
yourself:

```sh
key_file="$(mktemp)"
curl -fsSL \
  -o "$key_file" \
  https://denialwm.github.io/denial/denial-repo-key.asc
gpg --show-keys --with-fingerprint "$key_file"
```

Only after the displayed fingerprint exactly matches the value above, import
and locally trust it:

```sh
sudo pacman-key --add "$key_file"
sudo pacman-key --lsign-key AE4108FA5E91E26BE0EE331E0F5B3AD16E023091
rm "$key_file"
```

Add the following section after the official repositories in
`/etc/pacman.conf`:

```ini
[denial]
SigLevel = Required TrustedOnly
Server = https://denialwm.github.io/denial/$arch
```

{{% /details %}}

Then update the system and install Denial:

```sh
sudo pacman -Syu denial
```

Installing `denial` automatically selects the compatible
`denial-flutter-engine` package.

## Check the installation

Before logging out of your current desktop, run:

```sh
denial-session --check
```

This checks the installed session and the graphics environment without
starting another compositor.

## Start Denial

Log out, select **Denial** in your display manager, and sign in. SDDM is
supported, but any display manager that exposes the installed Wayland session
entry can start it.

The desktop renders with Denial's compositor-integrated Impeller GLES backend
by default. Skia/Ganesh remains available as a driver-compatibility fallback;
see [Renderer fallback](/docs/configuration/#renderer-fallback) if the first
session has rendering corruption or fails to present.

The standard display-manager session starts unlocked. This is intentional:
the display manager has already authenticated you, so immediately showing
Denial's lock screen would normally ask for the same password twice.

### Autologin and direct startup

If a session manager starts Denial without authenticating the user first, use
the startup lock:

```sh
uwsm start -e -D Denial -- /usr/bin/denial-session --start-locked
```

`--start-locked` closes Denial's native security gate before Flutter starts,
so the first visible state is the PAM-backed lock screen. This is the
appropriate form for a greetd `initial_session`, autologin, or another direct
boot path. Do not add it to a normal authenticated display-manager entry
unless the deliberate second password prompt is wanted.

The supported session-launcher modes are:

| Invocation | Result |
| --- | --- |
| `denial-session` | Start the packaged desktop after an authenticated display-manager login |
| `denial-session --check` | Validate the installation and graphics prerequisites without starting a compositor |
| `denial-session --start-locked` | Start with the native security gate and Flutter lock screen already locked |

Other `deniald` command-line switches are intended for controlled development
and diagnostics rather than persistent user configuration. Run
`deniald --help` to inspect the options provided by the installed build.

Open a terminal in Denial and verify the native control connection:

```sh
denialctl status
denialctl outputs
```

The first command reports the compositor and Flutter shell state. The second
lists connected outputs, modes, positions, scale, and power state.

## Update or remove

Denial follows the normal full-system Arch upgrade path:

```sh
sudo pacman -Syu
```

To remove the compositor and dependencies no longer required by other
packages:

```sh
sudo pacman -Rns denial
```

If the optional live-development environment is installed, remove both
packages together:

```sh
sudo pacman -Rns denial-ui-development denial
```

Removing the package does not delete user configuration or an editable
`~/DenialUI` checkout.
