---
title: 截图与屏幕共享
weight: 50
prev: system-services
next: control-and-recovery
---

Denial 内置区域截图流程。外部工具可以通过 `ext-image-copy-capture-v1` 捕获整个输出或
单个窗口，旧工具可以使用 wlr screencopy 协议第 3 版。桌面 Portal 会把捕获的帧转换为
浏览器和沙盒应用可用的 PipeWire 流。

## 内置截图

按 `Super+Shift+S` 冻结当前桌面。指针所在输出提供捕获帧时钟；可以在桌面任意位置拖动
框选要捕获的内容，按 `Escape` 或鼠标右键可取消。

Denial 会把唯一命名的 PNG 写入：

1. `DENIAL_SCREENSHOT_DIR` 指定的目录（如果已设置）；或
2. 默认目录 `~/Pictures/Screenshots`。

PNG 还会放入剪贴板，可直接粘贴到支持图片的应用中。选择界面会主动隐藏软件光标。
移动端桌面外壳中的“截图”快捷设置会直接捕获整个桌面，不打开区域选择器。

可在 **设置 → 快捷键** 中修改或禁用此快捷键。

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
`xdg-desktop-portal-wlr`；其他桌面 Portal 请求使用 GTK 后端。Denial 为其配置了 Zenity
显示器选择器，它会作为普通桌面窗口打开。

完整路径如下：

```text
应用 → 桌面 Portal → xdg-desktop-portal-wlr → Denial 图像捕获
     → PipeWire 流 → 应用
```

如果应用显示系统屏幕共享对话框，请在其中选择显示器。合成器本身不链接 PipeWire；
流由 Portal 后端管理。
