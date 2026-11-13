---
title: 安装到手机
weight: 27
prev: mobile-and-tablets
next: configuration
---

Denial Mobile 通过一个镜像安装，所有手机和平板共用同一个镜像：Arch Linux ARM，
加上 Denial、手机应用和 [Droidloom](../droidloom/)。每台设备只需要再加上自己的
boot 镜像，里面是它的内核。

安装会替换所安装槽位上的 Android。请先备份想保留的内容。

## 设备

| 设备 | boot 镜像 | 测试所用的原厂固件 | bootloader 的 fastboot 能否写入 `boot` 和 `init_boot` |
| --- | --- | --- | :---: |
| RedMagic 11 Pro | [nx809j-boot-321.zip](https://packages.denialwm.org/images/boot/nx809j/nx809j-boot-321.zip) | `Kaanapali.LA.1.0.r1-00850-STD.PROD-1.124266.75` | 否 |
| OnePlus Pad 4 | [iceland-boot-358.zip](https://packages.denialwm.org/images/boot/iceland/iceland-boot-358.zip) | `Kaanapali.LA.1.0.r1-00975-STD.PROD-1` | 是 |

[设备列表](https://denialwm.org/mobile.html#devices)中的其他设备会在镜像发布后
加入此表。

## 下载

| 文件 | 内容 |
| --- | --- |
| [denial-mobile-2026.11.13.zip](https://packages.denialwm.org/images/denial-mobile-2026.11.13.zip)（1.8 GB） | `userdata.img`，系统；`init_boot.img`，所有手机共用的安装程序；`flash.sh`；`SHA256SUMS` |
| 上表中你的设备的 boot 镜像 | `boot.img`，内核；`SHA256SUMS` |

每个下载旁边都有一个 `.sha256` 文件。先校验下载，解压，再校验里面的文件：

```console
sha256sum -c denial-mobile-2026.11.13.zip.sha256
unzip denial-mobile-2026.11.13.zip
cd denial-mobile-2026.11.13 && sha256sum -c SHA256SUMS
```

电脑上还需要 Android platform tools 里的 `fastboot`。

## 开始之前

有两件事需要你自己完成，本指南不涉及：

1. 解锁手机的 bootloader。
2. 把 `boot.img` 写入当前活动槽位的 `boot`，把 `init_boot.img` 写入它的
   `init_boot`。

如果手机自带的 bootloader 能通过 fastboot 写入这两个分区，上表会注明，命令是：

```console
fastboot flash boot boot.img
fastboot flash init_boot init_boot.img
fastboot reboot
```

名称里不带槽位时，`fastboot` 写入当前活动槽位，也就是手机启动所用的那个。只有
想把 Denial 装到另一个槽位时，才需要写明（`boot_a`、`boot_b`）。

如果不能，例如 RedMagic 11 Pro，就需要用厂商自己的刷写方式写入。这只需要做
一次：之后的内核通过 Denial 的安装程序写入（见[更新](#更新)）。

手机需要保留原厂固件。内核从手机的原厂分区加载基带、音频和传感器固件；上表
列出了每个 boot 镜像测试时所用的原厂版本。固件版本不同时，手机照常启动，并
提示测试所用的版本；缺少必需文件时，手机停在安装界面，并提示应刷入哪个版本。

## 安装界面

`init_boot.img` 是一个小程序，手机每次启动时都会先运行它，早于任何系统。它
先在 `denial`、再在 `userdata` 上查找已安装的 Denial 系统并启动它。出现以下
情况时，它会停在安装界面：

- 还没有安装系统，也就是刚写入两个镜像之后的状态；
- 手机启动时按住任一音量键，从 bootloader 的标志出现一直按到界面出现。

界面上显示手机名称、停在这里的原因，以及安装命令。界面显示期间，手机通过 USB
响应 `fastboot`，并且只接受以下命令：

| 命令 | 作用 |
| --- | --- |
| `fastboot flash userdata userdata.img` | 写入系统（有 `denial` 分区时用 `denial` 代替 `userdata`） |
| `fastboot flash package FILE.pkg.tar.zst` | 存入一个软件包，系统下次启动时安装 |
| `fastboot flash ssh-key KEY.pub` | 为你的账户存入一个 SSH 公钥 |
| `fastboot flash boot boot.img` | 把内核写入手机启动所用的槽位 |
| `fastboot flash init_boot init_boot.img` | 把安装程序自身写入该槽位 |
| `fastboot reboot` | 离开安装界面 |

除此之外它不写入任何东西：不改动分区表，也不改动另一个槽位。只有在这里，
`fastboot getvar denial-install` 才会回答 `yes`，据此可以把这个界面和 bootloader
自带的 fastboot 区分开。

## 安装

启动手机。两个镜像就位且尚未安装系统时，手机会停在安装界面，通过 USB 等待
fastboot。

在 Linux 和 macOS 上，在解压后的文件夹里运行：

```console
sh flash.sh
```

也可以在任何系统上自己运行命令：

```console
fastboot flash userdata userdata.img
fastboot reboot
```

{{< callout type="warning" >}}
写入 `userdata` 会清除 Android 的数据。如果手机上有名为 `denial` 的分区，系统
会装到那里（`fastboot flash denial userdata.img`），`userdata` 保持不变；
`flash.sh` 会自动选择。
{{< /callout >}}

### Google 应用

Droidloom 运行 Android 应用时不带 Google 应用。如需 Play 商店和 Play 服务，从
[packages.denialwm.org/gapps/aarch64/](https://packages.denialwm.org/gapps/aarch64/)
下载软件包，在写入系统之后、重启之前刷入：

```console
fastboot flash userdata userdata.img
fastboot flash package droidloom-gapps-4.9.20260513-1-aarch64.pkg.tar.zst
fastboot reboot
```

或者运行 `sh flash.sh droidloom-gapps-4.9.20260513-1-aarch64.pkg.tar.zst`。手机
会在首次启动时安装它。Google 应用必须在 Android 第一次启动之前就位：它们无法
加入已经存在的 Android 数据。

### SSH 密钥

手机上的 SSH 只接受密钥，而镜像里没有任何密钥。离开安装界面之前，把你的公钥
交给它：

```console
fastboot flash ssh-key ~/.ssh/id_ed25519.pub
fastboot reboot
```

密钥会交给你在设置向导中创建的账户，此后通过 USB 线可以用
`ssh 你的用户名@10.77.71.2` 登录，也可以用手机在 Wi-Fi 上的地址。没有密钥时，
唯一的入口是手机自己的屏幕。之后也可以用同样的方式添加：启动时按住音量键，
刷入密钥，重启。

## 首次启动

手机重启后进入设置向导：语言、Wi-Fi、时区、姓名和密码、锁屏 PIN、指纹（如果
手机有指纹传感器），以及手机名称。向导结束后，Android 随你的会话一起启动。

你的账户可以用自己的密码执行 `sudo`。

## 更新

系统的更新方式与任何 Arch Linux 相同：

```console
sudo pacman -Syu
```

这会更新 Denial、应用、Droidloom 和设备服务。内核在 boot 镜像里：下载你的设备
的新 boot 镜像，然后在手机启动时按住任一音量键，从 bootloader 的标志出现一直
按到安装界面出现。接着运行：

```console
fastboot flash boot boot.img
fastboot reboot
```

安装界面的 fastboot 在所有手机上都能写入 `boot` 和 `init_boot`，包括 bootloader
自身不能写入的手机。它始终写入手机启动所用的槽位，并拒绝写入另一个槽位。

## 重新安装

启动时按住音量键进入安装界面，然后按上面的步骤重新安装。这会清除已安装的系统
及其数据；如果还想找回 Android 的数据，请先
[备份 Android](https://github.com/denialwm/droidloom/blob/main/docs/INSTALL.md#back-up-and-restore-android)。
