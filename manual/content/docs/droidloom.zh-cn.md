---
title: Droidloom
weight: 90
prev: development
---

[Droidloom](https://github.com/denialwm/droidloom) 在独立的 Linux Wayland 窗口中运行
Android 应用。它使用共享内核的 Android 用户空间、真实的 Android API、GPU 加速，以及
原生桌面应用目录。明日方舟：终末地通过 Droidloom 运行。

这是早期预览。已发布的软件包流程面向 x86_64 的 Arch Linux 和 Omarchy，使用 AMD 或
Intel 显卡。NVIDIA 渲染尚未验证。WhatsApp 和 Phone 已在 Omarchy 的 Hyprland 上测试。
启动需要手动进行：启动应用不会拉起已经停止的运行时。

Droidloom 不使用闭源库。其原创代码采用
[GPL-3.0-or-later](https://github.com/denialwm/droidloom/blob/main/LICENSE)。
不使用专有翻译二进制。不附带 Google 应用。你自行安装的 APK 仍遵守它自己的条款。

预览版的安装步骤见上游指南：
[docs/INSTALL.md](https://github.com/denialwm/droidloom/blob/main/docs/INSTALL.md)。
安装前请阅读
[已知问题](https://github.com/denialwm/droidloom/blob/main/docs/KNOWN_ISSUES.md)。

Droidloom 的文本输入契约涵盖 Android 输入法，以及关闭 Denial 键盘。参见
[文本输入契约](https://github.com/denialwm/droidloom/blob/main/docs/contracts/text-input-v1.md)。
