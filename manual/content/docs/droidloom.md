---
title: Droidloom
weight: 90
prev: development
---

[Droidloom](https://github.com/denialwm/droidloom) runs Android apps in separate
Linux Wayland windows. It uses a shared-kernel Android userspace with real
Android APIs, GPU acceleration, and a native desktop application catalog.
Arknights: Endfield runs through Droidloom.

This is an early preview. Prebuilt pacman packages are published for x86_64
Arch Linux and aarch64 Arch Linux ARM in the
[latest release](https://github.com/denialwm/droidloom/releases/latest).
AMD and Intel GPUs render natively. On x86_64, NVIDIA GPUs render through
[GPU forwarding](https://denialwm.org/droidloom.html#nvidia); `droidloomctl gpu`
shows which GPU Android uses and lets you choose another. WhatsApp and Phone have been tested on Hyprland.
Startup is manual: launching an app does not start a stopped runtime.

Droidloom does not use closed-source libraries. Its original code is
[GPL-3.0-or-later](https://github.com/denialwm/droidloom/blob/main/LICENSE).
No proprietary translation binaries are used. Google apps are not included.
An APK you install keeps its own terms.

Install the preview from the upstream guide:
[docs/INSTALL.md](https://github.com/denialwm/droidloom/blob/main/docs/INSTALL.md).
Read [known issues](https://github.com/denialwm/droidloom/blob/main/docs/KNOWN_ISSUES.md)
before installing.

Droidloom's text-input contract covers Android IME and Denial keyboard
dismissal. See the
[text input contract](https://github.com/denialwm/droidloom/blob/main/docs/contracts/text-input-v1.md).
