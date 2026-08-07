---
title: 截图与屏幕共享
weight: 50
prev: system-services
next: control-and-recovery
---

Denial 实现了 wlr screencopy 协议第 3 版。原生 Wayland 捕获工具可以读取整个输出或明确
指定的矩形区域，桌面 Portal 则把相同的帧转换成应用可用的 PipeWire 流。

## 使用 grim 截图

如果尚未安装，请安装直接捕获工具：

```sh
sudo pacman -S grim wf-recorder
```

捕获桌面：

```sh
grim screenshot.png
```

按连接器名称选择输出：

```sh
denialctl outputs
grim -o DP-1 screenshot.png
```

使用逻辑坐标捕获已知区域：

```sh
grim -g "100,100 1280x720" region.png
```

## 使用 wf-recorder 录屏

录制屏幕，直到 `wf-recorder` 被停止：

```sh
wf-recorder -f recording.mp4
```

添加桌面音频、选择一个输出或使用明确指定的区域：

```sh
wf-recorder -a -f recording-with-audio.mp4
wf-recorder -o DP-1 -f recording.mp4
wf-recorder -g "100,100 1280x720" -f region.mp4
```

## 浏览器、OBS 和沙盒应用

Arch 软件包安装的 Portal 路由会把 ScreenCast 和 Screenshot 请求发送到
`xdg-desktop-portal-wlr`；其他桌面 Portal 请求使用 GTK 后端。显示器选择器使用 Zenity，
因为它能作为普通桌面窗口运行。

完整路径如下：

```text
应用 → 桌面 Portal → xdg-desktop-portal-wlr → Denial screencopy
     → PipeWire 流 → 应用
```

如果应用显示系统屏幕共享对话框，请在其中选择显示器。合成器本身不链接 PipeWire；
流由 Portal 后端管理。

## 当前限制

- `slurp` 需要 layer-shell，而 Denial 目前不会公布该协议。因此无法使用交互式 `slurp`
  区域选择，但明确指定坐标仍然有效。
- 出于同一原因，目前还不能使用基于 Portal 的交互式截图区域和颜色拾取。
- Flutter 桌面外壳会把软件光标绘制到桌面图集中，因此即使客户端没有请求光标，捕获的
  帧目前仍会包含它。
