---
title: 系统服务
weight: 40
prev: configuration
next: screen-capture
---

Denial 使用标准 Linux 桌面服务，而不是维护独立的设备数据库。缺少某项服务时，只会禁用
对应的控制项，不会影响桌面的其他部分。

## 支持的集成

| 功能 | 服务或接口 | Denial 支持 |
| --- | --- | --- |
| 桌面音频 | PulseAudio 协议 | 默认输出的音量与静音、硬件按键和各应用音频流 |
| 网络 | NetworkManager | Wi-Fi 开关、扫描、状态、连接、断开连接和已保存的配置文件 |
| 蓝牙 | BlueZ | 发现、配对、信任、连接、断开连接和移除设备 |
| 媒体控制 | MPRIS | 元数据，以及上一首、播放或暂停和下一首操作 |
| 会话电源 | `systemd-logind` | 挂起、休眠、重启、关机和抑制器处理 |
| 电源模式 | `power-profiles-daemon` | 可用时提供节能、平衡和性能模式 |
| AMD 调优 | LACT | 可选的低、自动和高性能预设 |
| 屏幕共享 | PipeWire 和桌面 Portal | 为浏览器、OBS 和沙盒应用捕获显示器 |

## 音频

Denial 是原生 PulseAudio 协议客户端，支持：

- 通过 `pipewire-pulse` 使用 PipeWire；
- PulseAudio 服务器；
- 提供兼容 PulseAudio 套接字的其他服务器。

仪表板和音频设置可以控制默认输出和各应用的播放流。硬件音量键使用同一个原生连接，
因此无论应用焦点在哪里都能继续工作。

如果在典型的 PipeWire 桌面上无法使用音频控制，请确认已安装兼容服务：

```sh
sudo pacman -S pipewire-pulse
```

## 网络

网络页面需要系统总线上的 NetworkManager。Denial 可以为以下网络创建并使用 Wi-Fi
配置文件：

- 开放网络；
- WEP；
- WPA 或 WPA2 Personal；
- WPA3 Personal；
- OWE，也称 Enhanced Open。

企业 Wi-Fi 可通过现有的 NetworkManager 配置文件使用。请先用 NetworkManager 工具为
该配置文件创建凭据，然后在 Denial 中选择已保存的连接。Denial 目前不能新建企业网络
配置文件。

NetworkManager 可能会通过 polkit 请求更改系统连接的权限。没有该权限时仍可查看状态，
但部分操作会被禁用。

在 Arch 上安装并启动 NetworkManager：

```sh
sudo pacman -S networkmanager
sudo systemctl enable --now NetworkManager
```

## 蓝牙

蓝牙使用 BlueZ。Denial 可以开启适配器、扫描、配对、确认或输入密钥、信任设备、连接、
断开连接和移除设备。PIN 或密钥只会传给 BlueZ 完成配对交换，Denial 不会保留它。

如果没有显示适配器，请先检查 BlueZ 服务是否正在运行：

```sh
sudo pacman -S bluez
sudo systemctl enable --now bluetooth
```

## 电源与硬件状态

注销和机器电源操作通过 `systemd-logind` 完成，并遵守活跃的抑制器。可选的
`power-profiles-daemon` 集成会显示机器支持的电源模式。

LACT 可以通过其本地守护进程套接字，为第一个受支持的 AMD GPU 提供性能预设。即使没有
安装 LACT，Denial 仍然可以正常使用。

系统栏从内核读取 CPU 活动，从系统读取电池状态，通过 sysfs 读取 AMD GPU 负载，并在
可用时通过 NVML 读取 NVIDIA 负载。不支持的传感器会直接省略，而不会被视为错误。
