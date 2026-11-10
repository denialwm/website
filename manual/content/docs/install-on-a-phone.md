---
title: Install on a phone
weight: 27
prev: mobile-and-tablets
next: configuration
---

Denial Mobile installs from one image that is the same for every phone and
tablet: Arch Linux ARM with Denial, the phone apps and
[Droidloom](../droidloom/). Each device adds only its own boot image, which
holds its kernel.

Installing replaces the Android on the slot you install to. Back up what you
want to keep first.

## Devices

| Device | Boot image | Tested with stock firmware | Bootloader fastboot writes `boot` and `init_boot` |
| --- | --- | --- | :---: |
| RedMagic 11 Pro | [nx809j-boot-321.zip](https://packages.denialwm.org/images/boot/nx809j/nx809j-boot-321.zip) | `Kaanapali.LA.1.0.r1-00850-STD.PROD-1.124266.75` | No |

Other devices from the [device list](https://denialwm.org/mobile.html#devices)
join this table as their images are published.

## Downloads

| File | Holds |
| --- | --- |
| [denial-mobile-2026.11.11.zip](https://packages.denialwm.org/images/denial-mobile-2026.11.11.zip) (1.8 GB) | `userdata.img`, the system; `init_boot.img`, the installer every phone shares; `flash.sh`; `SHA256SUMS` |
| Your device's boot image, from the table above | `boot.img`, the kernel; `SHA256SUMS` |

Every download has a `.sha256` file beside it. Check the download, unpack it,
then check the files inside:

```console
sha256sum -c denial-mobile-2026.11.11.zip.sha256
unzip denial-mobile-2026.11.11.zip
cd denial-mobile-2026.11.11 && sha256sum -c SHA256SUMS
```

You also need `fastboot` on your computer, from Android's platform tools.

## Before you start

Two things are yours to do, and this guide does not cover them:

1. Unlock the phone's bootloader.
2. Write `boot.img` to `boot` and `init_boot.img` to `init_boot`, on the
   active slot.

Where a phone's own bootloader accepts both from fastboot, the table above
says so, and the commands are:

```console
fastboot flash boot boot.img
fastboot flash init_boot init_boot.img
fastboot reboot
```

Where it does not, as on the RedMagic 11 Pro, they have to be written with
the vendor's own flashing method. That is needed once: later kernels go in
through Denial's installer (see [Updating](#updating)).

The phone needs its stock firmware in place. The kernel loads the modem,
audio and sensor firmware from the phone's stock partitions; the table names
the stock release each boot image was tested with. With other firmware the
phone starts and says which release was tested; with required files missing
it stops at the install screen and says which release to flash.

## The install screen

`init_boot.img` is a small program that runs every time the phone starts,
before any system. It looks for an installed Denial system on `denial`, then
on `userdata`, and starts it. It stops at the install screen instead when:

- no system is installed yet, which is the case right after you wrote the
  two images;
- you hold a volume key while the phone starts, from the bootloader's logo
  until the screen appears.

The screen shows the phone's name, why it stopped, and the commands to
install. While it is up, the phone answers `fastboot` over USB, and takes
only these:

| Command | Does |
| --- | --- |
| `fastboot flash userdata userdata.img` | writes the system (`denial` in place of `userdata` where that partition exists) |
| `fastboot flash package FILE.pkg.tar.zst` | stores a package the system installs as it next starts |
| `fastboot flash ssh-key KEY.pub` | stores an SSH public key for your account |
| `fastboot flash boot boot.img` | writes the kernel, on the slot the phone started from |
| `fastboot flash init_boot init_boot.img` | writes the installer itself, on that slot |
| `fastboot reboot` | leaves the install screen |

It writes nothing else: never the partition table, never the other slot.
`fastboot getvar denial-install` answers `yes` only here, which tells this
screen apart from the bootloader's own fastboot.

## Install

Start the phone. With the two images in place and no system installed yet,
it stops at the install screen and waits for fastboot over USB.

On Linux and macOS, from the unpacked folder:

```console
sh flash.sh
```

Or run the commands yourself, on any system:

```console
fastboot flash userdata userdata.img
fastboot reboot
```

{{< callout type="warning" >}}
Writing `userdata` erases Android's data. A phone that has a partition named
`denial` takes the system there instead (`fastboot flash denial
userdata.img`) and keeps `userdata`; `flash.sh` picks it by itself.
{{< /callout >}}

### Google apps

Droidloom runs Android apps without Google apps. To have the Play Store and
Play services, download the package from
[packages.denialwm.org/gapps/aarch64/](https://packages.denialwm.org/gapps/aarch64/)
and flash it after the system, before the reboot:

```console
fastboot flash userdata userdata.img
fastboot flash package droidloom-gapps-4.9.20260513-1-aarch64.pkg.tar.zst
fastboot reboot
```

or `sh flash.sh droidloom-gapps-4.9.20260513-1-aarch64.pkg.tar.zst`. The
phone installs it as it first starts. Google apps have to be there before
Android starts for the first time: they cannot join Android data that
already exists.

### An SSH key

SSH on the phone accepts keys only, and the image holds none. Before you
leave the install screen, give it your public key:

```console
fastboot flash ssh-key ~/.ssh/id_ed25519.pub
fastboot reboot
```

The key goes to the account you make in setup, and from then on
`ssh YOU@10.77.71.2` works over the USB cable, or the phone's address on
Wi-Fi. Without a key the only way in is the phone's own screen. You can add
one later the same way: hold a volume key while the phone starts, flash the
key, reboot.

## First start

The phone restarts into setup: language, Wi-Fi, time zone, your name and
password, a lock PIN, a fingerprint where the phone has a reader, and the
phone's name. Android starts with your session when setup ends.

Your account can use `sudo` with its password.

## Updating

The system updates like any Arch Linux:

```console
sudo pacman -Syu
```

That covers Denial, the apps, Droidloom and the device services. The kernel
is the boot image: download the newer one for your device, then bring the
phone to the install screen by holding a volume key while it starts, from the
bootloader's logo until the screen appears. From there:

```console
fastboot flash boot boot.img
fastboot reboot
```

The install screen's fastboot writes `boot` and `init_boot` on every phone,
also where the bootloader's own does not.

## Starting over

Hold a volume key while the phone starts to reach the install screen, then
install again as above. That erases the installed system and its data;
[back up Android](https://github.com/denialwm/droidloom/blob/main/docs/INSTALL.md#back-up-and-restore-android)
first if you want it back.
