---
title: Getting started
weight: 10
prev: /docs
next: using-denial
---

Denial publishes first-party **x86-64** packages for:

- Arch Linux, CachyOS, and Omarchy 4.0;
- Debian 13 (trixie);
- Ubuntu 24.04 LTS (noble); and
- Fedora 44.

Alpine Linux 3.24 is also supported through signed APK files attached to each
GitHub release. NixOS 26.05 and Void Linux have completed runtime validation,
but do not yet have first-party packages. Debian Forky/Sid may use the Debian
13 `trixie` repository on a best-effort basis; that rolling target has not
completed the validation matrix.

| Architecture | Working | Binaries available |
| --- | :---: | :---: |
| x86-64 | ✅ | ✅ |
| ARM64 (AArch64) | ✅ | ❌ |

ARM64 is fully supported, but first-party ARM64 binaries are not published
yet. Build Denial from source on ARM64 instead of using the repository setup
below.

The native package installs the compositor, its matching Flutter engine, the
embedded shell, the standalone Settings application, Xwayland support,
session integration, and desktop portals.

## Requirements

A session needs a logind-compatible seat/session service and a user D-Bus.
The graphics path requires atomic KMS, GBM/EGL, hardware OpenGL ES 3.0 or
newer, and an XRGB8888 format/modifier that the renderer and every active
primary plane can share. Older GPUs and simple virtual-machine display devices
may not meet those requirements. `denial-session --check` reports the
available devices and prerequisites before you log out.

## Install

For Arch, CachyOS, Omarchy, Debian, Ubuntu, and Fedora, the guided installer
detects the distribution, verifies Denial's full signing-key fingerprint,
shows every planned change, and asks before using `sudo`:

```sh
sh -c 'if ! command -v curl >/dev/null 2>&1; then echo "Error: curl is not available." >&2; exit 1; fi; curl -fsSL https://install.denialwm.org | sh'
```

> [!TIP]
> The installer checks the complete Denial release-key fingerprint:
> `AE4108FA5E91E26BE0EE331E0F5B3AD16E023091`. It configures the repository
> but deliberately installs no packages.

After setup, install Denial explicitly with the native package manager:

{{< tabs >}}

  {{< tab name="Arch / CachyOS / Omarchy" >}}
  ```sh
  sudo pacman -Syu denial
  ```
  {{< /tab >}}

  {{< tab name="Debian / Ubuntu" >}}
  ```sh
  sudo apt update && sudo apt install denial
  ```
  {{< /tab >}}

  {{< tab name="Fedora" >}}
  ```sh
  sudo dnf install denial
  ```
  {{< /tab >}}

{{< /tabs >}}

Installing `denial` automatically selects the compatible
`denial-flutter-engine` package.

### Alpine Linux 3.24

Alpine currently uses signed direct downloads rather than a package
repository. Replace `X.Y.Z` with a release version, verify both APKs with the
same pinned release key, then install the verified local files:

```sh
version=X.Y.Z
release="https://github.com/denialwm/denial/releases/download/v$version"

doas apk add gnupg
curl -fLO https://denialwm.github.io/denial/denial-repo-key.asc
curl -fLO "$release/denial-flutter-engine-$version-r1.apk"
curl -fLO "$release/denial-flutter-engine-$version-r1.apk.sig"
curl -fLO "$release/denial-$version-r1.apk"
curl -fLO "$release/denial-$version-r1.apk.sig"

fingerprint="$(
  gpg --show-keys --with-colons denial-repo-key.asc \
    | awk -F: '$1 == "fpr" { print $10; exit }'
)"
test "$fingerprint" = AE4108FA5E91E26BE0EE331E0F5B3AD16E023091
gpg --import denial-repo-key.asc
gpg --verify "denial-flutter-engine-$version-r1.apk.sig" \
  "denial-flutter-engine-$version-r1.apk"
gpg --verify "denial-$version-r1.apk.sig" \
  "denial-$version-r1.apk"
doas apk add --allow-untrusted \
  "./denial-flutter-engine-$version-r1.apk" \
  "./denial-$version-r1.apk"
```

Here, `--allow-untrusted` only bypasses APK's native RSA repository format;
the preceding OpenPGP checks authenticate the exact downloaded files.

{{% details title="Manual repository setup" closed="true" %}}

If you do not want to use the installer, download and inspect the public key
yourself. Require the complete fingerprint instead of a short key ID before
changing the package manager:

```sh
key_fingerprint='AE4108FA5E91E26BE0EE331E0F5B3AD16E023091'
key_tmp="$(mktemp -d)"
trap 'rm -rf -- "$key_tmp"' EXIT

curl \
  --proto '=https' \
  --tlsv1.2 \
  --fail \
  --silent \
  --show-error \
  --location \
  --output "$key_tmp/denial-repo-key.asc" \
  https://denialwm.github.io/denial/denial-repo-key.asc

downloaded_fingerprint="$(
  gpg --batch --show-keys --with-colons --fingerprint \
    "$key_tmp/denial-repo-key.asc" \
    | awk -F: '$1 == "fpr" { print toupper($10); exit }'
)"
test "$downloaded_fingerprint" = "$key_fingerprint"
gpg --show-keys --with-fingerprint "$key_tmp/denial-repo-key.asc"
```

### Arch Linux, CachyOS, and Omarchy

Only after the fingerprint check passes, import and locally trust the key:

```sh
sudo pacman-key --add "$key_tmp/denial-repo-key.asc"
sudo pacman-key --lsign-key "$key_fingerprint"
```

Add the following section after the official repositories in
`/etc/pacman.conf`:

```ini
[denial]
SigLevel = Required TrustedOnly
Server = https://denialwm.github.io/denial/$arch
```

`Required TrustedOnly` makes Pacman require a trusted signature for both the
repository database and every package.

### Debian 13

Install the verified key as a repository-scoped APT keyring:

```sh
sudo install -d -m 0755 /etc/apt/keyrings
sudo install -m 0644 \
  "$key_tmp/denial-repo-key.asc" \
  /etc/apt/keyrings/denial.asc
```

Create `/etc/apt/sources.list.d/denial.sources` with:

```text
Types: deb
URIs: https://denialwm.github.io/denial/apt
Suites: trixie
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/denial.asc
```

### Ubuntu 24.04 LTS

Install the key in `/etc/apt/keyrings/denial.asc` as above, then create
`/etc/apt/sources.list.d/denial.sources` with:

```text
Types: deb
URIs: https://denialwm.github.io/denial/apt
Suites: noble
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/denial.asc
```

`Signed-By` limits trust in this key to the Denial repository. APT verifies
the signed `InRelease` metadata before accepting its package checksums.

### Fedora 44

Install and import the verified key:

```sh
sudo install -D -m 0644 \
  "$key_tmp/denial-repo-key.asc" \
  /etc/pki/rpm-gpg/RPM-GPG-KEY-denial
sudo rpmkeys --import /etc/pki/rpm-gpg/RPM-GPG-KEY-denial
```

Create `/etc/yum.repos.d/denial.repo` with:

```ini
[denial]
name=Denial public beta
baseurl=https://denialwm.github.io/denial/rpm/fedora/$releasever/$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-denial
skip_if_unavailable=0
```

`repo_gpgcheck=1` authenticates repository metadata, while `gpgcheck=1`
requires the embedded signature on each RPM.

{{% /details %}}

## Check the installation

Before logging out of your current desktop, run:

```sh
denial-session --check
```

This checks the installed session, bundle, output configuration, DRM and
render-device selection, Qt portal theme, and Xwayland without starting
another compositor.

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
/usr/bin/denial-session --start-locked
```

`--start-locked` closes Denial's native security gate before Flutter starts,
so the first visible state is the PAM-backed lock screen. This is the
appropriate form for autologin or another direct boot path. For example,
greetd can use:

```toml
[initial_session]
command = "/usr/bin/denial-session --start-locked"
user = "alice"
```

Do not add it to a normal authenticated display-manager entry unless the
deliberate second password prompt is wanted.

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
lists connected outputs, modes, positions, scale, power state, and the
configuration serial.

## Update or remove

Use the normal native update path:

```sh
# Arch Linux, CachyOS, or Omarchy
sudo pacman -Syu

# Debian 13 or Ubuntu 24.04
sudo apt update && sudo apt upgrade

# Fedora 44
sudo dnf upgrade

# Alpine Linux 3.24: repeat the signed direct-download procedure above
```

Remove Denial with the matching package manager:

```sh
# Arch Linux, CachyOS, or Omarchy
sudo pacman -Rns denial

# Debian 13 or Ubuntu 24.04
sudo apt remove denial

# Fedora 44
sudo dnf remove denial

# Alpine Linux 3.24
doas apk del denial
```

The optional `denial-ui-development` package is currently published only for
Arch-family systems. Removing a package does not remove the repository
configuration, user configuration, or an editable `~/DenialUI` checkout.
