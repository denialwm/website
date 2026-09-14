---
title: 系统服务
weight: 40
prev: configuration
next: screen-capture
---

Denial 使用标准 Linux 服务与协议，而不维护平行的设备数据库。可选服务或硬件不可用时，
对应集成会隐藏或变成只读；合成器仍会继续运行。

## 集成一览

| 功能 | 服务或接口 | Denial 支持 |
| --- | --- | --- |
| 桌面音频 | PulseAudio 协议 | 输出选择、音量与静音、硬件按键及按应用音频流 |
| Wi-Fi | NetworkManager 或 iwd | 无线状态、扫描、联网状态、连接、断开、忘记及保存配置 |
| 蜂窝网络 | NetworkManager 与 ModemManager | 注册与信号状态、Bearer 状态、移动数据开关和主 SIM PIN 提示 |
| 蓝牙 | BlueZ | 发现、配对代理、口令、信任、连接、断开和移除 |
| 电池 | UPower | 充电状态、健康与能量详情、时间估计和受支持的充电阈值开关 |
| 亮度 | 内核背光与 DDC/CI | 按输出读取和控制 |
| 媒体 | MPRIS | 元数据、封面与播放控制 |
| 托盘 | StatusNotifier/AppIndicator 与 XEmbed | 图标、应用菜单与指针操作 |
| 会话电源 | 兼容 logind 的服务 | 挂起、休眠、重启、关机、授权与抑制器 |
| 电源配置 | power-profiles-daemon | 可用时提供省电、平衡与性能配置 |
| AMD 调优 | LACT | 可选的低、自动与高性能预设 |
| 认证 | PAM 与可选 fprintd | 密码解锁、自动指纹验证与录入 |
| 方向 | iio-sensor-proxy | 内置面板自动旋转 |
| 触觉 | hapticd | 可选且有界的轻触与指纹拒绝反馈 |
| 外观 | Denial Settings Portal | 向应用提供标准配色与强调色值 |
| 捕获 | wlr screencopy、PipeWire 与 Portal | 直接截图/录屏和显示器共享 |

## 音频

Denial 是原生 PulseAudio 协议客户端，可通过 `pipewire-pulse` 使用 PipeWire，也可连接
PulseAudio 服务器或其他兼容套接字。仪表板可选择默认输出；音频设置控制主音量与各应用
播放流。硬件音量键使用同一原生连接，不依赖应用焦点。

典型的 Arch PipeWire 系统可安装：

```sh
sudo pacman -S pipewire-pulse
```

## Wi-Fi 与蜂窝网络

当两个 Wi-Fi 后端都在运行时，Denial 优先使用 NetworkManager，因为它本身也可能使用
iwd。NetworkManager 不存在时，Denial 可直接连接 iwd。两个后端提供相同桌面界面，并
能处理服务重启。

Denial 可为开放、WEP、WPA/WPA2 Personal、WPA3 Personal 和 OWE 网络创建配置。
企业 Wi-Fi 可使用已有配置，但 Denial 不会创建新的企业凭据。NetworkManager 与 iwd
保管密码和连接；系统 D-Bus 与 polkit 策略决定允许哪些更改。

NetworkManager 与 ModemManager 都可用时，移动桌面外壳会显示蜂窝注册状态、实测信号
质量以及数据 Bearer 是否已连接。“移动数据”磁贴更改 NetworkManager 的全局 WWAN
状态，不会创建 APN 或运营商配置。主 SIM PIN 提示接受 4–8 位数字并显示剩余次数。它与
设备解锁相互独立：解锁 SIM 不会认证 Denial 会话，设备认证也不会关闭阻塞的 SIM 提示。
PUK 恢复和多 SIM 管理不在该界面范围内。

## 蓝牙

BlueZ 提供适配器电源、扫描、配对、信任与连接状态。Denial 注册配对代理来处理确认和
PIN/口令交换；输入内容只发送给 BlueZ 一次，不会保留。没有可用配对界面时，传入请求会
超时或被拒绝。

在 Arch 上：

```sh
sudo pacman -S bluez
sudo systemctl enable --now bluetooth
```

## 电源、电池与亮度

注销与机器电源请求使用活动的兼容 logind 会话，并遵守抑制器和授权。Denial 可分别安排
空闲锁定、DPMS 关屏与自动挂起期限；还会显示系统支持的 Linux 挂起模式（`s2idle`、
`shallow` 或 `deep`），并在 Denial 发起挂起时使用选中模式。

硬件提供数据时，UPower 会提供电池状态、警告级别、健康度、循环次数、能量、功率、
电压、温度和剩余时间估计。如果 UPower 支持充电阈值或固件优化充电开关，Settings 可以
启用；阈值本身仍由系统提供且只读。Denial 会据此发出低电量和严重低电量通知。

内置显示器使用关联的内核背光。外接显示器使用可用的 libddcutil ABI 和 DDC/CI VCP
控制。硬件缺失或关联有歧义时会保持未控制，而不是修改错误的显示器。

`power-profiles-daemon` 提供系统电源配置。LACT 还能为第一个受支持的 AMD GPU 提供预设。
两者都是可选集成。

## 指纹认证

如果 fprintd 报告读卡器和已录入手指，Denial 会在原生会话门锁定时自动开始验证，包括
`--start-locked` 会话。匹配成功仍需通过 PAM 账户验证，会唤醒 Denial 关闭的输出并
重置空闲期限。读卡器失败或没有录入时，密码认证仍然可用。

只有读卡器存在时，Settings 才显示指纹页面。列出或录入手指前会询问用户的 sudo 密码。
辅助进程只接受当前用户的这些有限操作，不会把密码放入进程参数，页面关闭时释放设备，
授权五分钟后过期。在 Arch 上安装 `fprintd` 和 `sudo` 即可启用该流程。

## 会话激活、Portal 与自动启动

桌面外壳和初始输出完成显示后，systemd 用户会话会发布发现的 Wayland、X11 和控制端点，
并启动 `denial-session.target`。Portal 与标准 XDG 自动启动条目因此会在有效套接字存在后
启动。elogind/非 systemd 系统的 D-Bus 激活仍能收到这些端点，但 XDG 自动启动需要该
系统自己的会话启动器。

`denial-portal` 为 Denial 已提交的配色和强调色实现桌面 Settings Portal。Denial 未实现的
Portal 命名空间仍以后备 GTK 处理。ScreenCast 与 Screenshot 路由到
`xdg-desktop-portal-wlr`；PipeWire 不进入合成器进程。

## 硬件状态

系统栏与锁屏从内核读取 CPU 负载，从 UPower 或原生 power-supply 状态读取电池数据，
从 sysfs 读取 AMD GPU 活动，并在可用时通过 NVML 读取 NVIDIA 活动。不支持的传感器会
被省略。绘图板工具使用 Wayland tablet-v2 的接近、压力、距离、倾斜、旋转、滚轮、笔尖
和按键事件；显式 libinput 输出映射优先，否则一次接近过程会跟随指针所在输出。
