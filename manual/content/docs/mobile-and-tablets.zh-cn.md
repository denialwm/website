---
title: 手机与平板
weight: 25
prev: using-denial
next: configuration
---

本页汇总手册里已经写明的移动桌面外壳、直接触控，以及这套外壳可以使用的系统服务。
公开软件包仍面向 x86-64 PC。移动设备目前使用架构匹配的源码构建。

## 窗口上的触控

在普通窗口上，直接触控保留一套合成器手势：

- 从顶部 48 个逻辑像素拖动可以移动窗口。
- 双指捏合围绕窗口中心调整大小。
- 从顶部区域双指向下轻扫可以最小化。
- 三个触点同时按下可以关闭窗口。

手势一旦被识别，Denial 会取消应用先前收到的触控序列。这些手势在原生表面边界识别，
因此即使应用不理解 Denial 的桌面外壳手势，它们仍然有效。触控、键盘和文本输入状态
（包括内置键盘）属于合成器协议。

## 移动桌面外壳

显式选择的移动桌面外壳额外提供：

- 分页主屏
- 最近应用
- 通知历史
- 快捷设置
- 状态栏
- 移动壁纸控制
- 屏幕键盘
- 旋转控制
- 边缘手势

Settings 可以从移动主屏打开，它仍是普通的 Denial 管理 Wayland 窗口。在移动桌面外壳上，
截图快捷设置会捕获整个桌面，而不打开区域选择器。

蜂窝网络状态、移动数据、SIM PIN、指纹显示、唤醒手势和触觉反馈只会在相应硬件与系统
服务可用时出现。

## 外壳可以使用的系统服务

Denial 使用主机上已有的服务。服务或硬件缺失时，对应集成会隐藏或变成只读。

在 NetworkManager 和 ModemManager 可用时，或使用
[Phonewave](https://github.com/denialwm/phonewave) 的 dmail 调制解调器服务时，移动桌面
外壳显示蜂窝网络注册状态、测得的信号质量，以及数据 Bearer 是否已连接。dmail 运行时，
Denial 优先读取它。移动数据开关改变的是 NetworkManager 的全局 WWAN 状态，或 dmail 的
数据状态，不会创建 APN 或运营商配置。主 SIM PIN 提示接受 4–8 位数字，并报告剩余
尝试次数。解锁 SIM 不会认证 Denial 会话，设备认证也不会消除仍在阻塞的 SIM 提示。
PUK 恢复和多 SIM 管理不在这个界面里。

指纹解锁需要在 **Settings → 锁屏** 中设置锁屏 PIN。如果 fprintd 报告有读卡器、用户
已录入指纹且已设置 PIN，原生会话门锁定时（包括 `--start-locked` 会话）会自动开始
验证。密码解锁始终可用。指纹设置页只在存在读卡器时出现，并且在列出或录入指纹之前会
要求输入锁屏 PIN。

Phonewave 的 `steinerd` 为内置面板提供自动旋转。Phonewave 的 `hapticd` 可以提供可选
且有界的轻触反馈，以及指纹拒绝反馈。

## 自定义桌面外壳

参考桌面（包括其移动场景）是一个插件。替代外壳也是插件，它实现
`package:denial_flutter_sdk/application.dart` 中的 `ShellApplication`，并拥有自己的
完整界面树。原生 Wayland 所有权、资源生命周期、认证执行和恢复仍由 Rust 负责。

## 这些内容写在哪里

- [使用 Denial]({{< relref "/docs/using-denial" >}}#触控与移动桌面外壳)
- [系统服务]({{< relref "/docs/system-services" >}})
- [设置与显示器]({{< relref "/docs/configuration" >}})
- [截图与屏幕共享]({{< relref "/docs/screen-capture" >}})
- [架构]({{< relref "/docs/architecture" >}}#输入与表面归属)
- [开发]({{< relref "/docs/development" >}}#构建自定义桌面外壳)
