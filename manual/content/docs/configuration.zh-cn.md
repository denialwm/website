---
title: 设置与显示器
weight: 30
prev: using-denial
next: system-services
---

Denial Settings 是独立的 Flutter Wayland 应用。它通过私有控制套接字发送类型化请求；
`deniald` 验证硬件与持久状态，并且是唯一写入配置的权威。大部分更改会直接应用到当前会话。

## Settings 页面

| 页面 | 控制内容 |
| --- | --- |
| 外观 | 深色、浅色或无偏好配色；壁纸或自定义强调色；光标主题和物理尺寸；形状、玻璃效果、不透明度、模糊及焦点窗口效果 |
| 语言 | 实时切换桌面外壳和 Settings 的语言 |
| 键盘 | XKB 布局、变体、选项、重复延迟和重复速率 |
| 鼠标与触控板 | 指针和手指滚动速度、轻触点击与自然滚动；仅在适合的硬件存在时显示 |
| 快捷键 | 合成器操作、应用、程序、Shell 命令与触控板手势 |
| 应用环境 | Denial 启动应用时使用的默认变量和按桌面条目区分的变量 |
| 动画 | 动画速度、面板运动、锁屏运动与关闭效果 |
| 桌面布局 | 堆叠、平铺或滚动布局；显示器本地工作区；系统栏；普通与最大化窗口间距 |
| 覆盖层 | 启动器、仪表板、通知和系统 HUD 的位置与尺寸 |
| 锁屏 | 壁纸、变暗、模糊、时钟比例、状态显示与通知隐私 |
| 指纹 | 为会话用户录入指纹；fprintd 报告设备时才显示 |
| 音频 | 默认输出选择、音量、静音和应用音频流 |
| 显示器与视频 | 主显示器、排列、模式、刷新率、旋转、缩放、VRR 和亮度 |
| 网络 | Wi-Fi 状态、扫描、连接和已保存配置 |
| 蓝牙 | 适配器状态、发现、配对、信任和已连接设备 |
| 电源 | 空闲锁定、关屏和挂起策略，挂起模式、电源配置、电池信息及受支持的充电限制 |
| 开发者 | Flutter 桌面外壳工作区、运行时与实时开发控制 |
| 关于 | 项目标识与致谢 |

偏好设置保存在：

```text
$XDG_CONFIG_HOME/denial/settings.json
```

未设置 `XDG_CONFIG_HOME` 时则为 `~/.config/denial/settings.json`。该文件有版本，会被迁移、
检查修订号，并由 `deniald` 以 `0600` 权限原子替换。Denial 运行时请使用 Settings；并发的
外部修改会被拒绝，而不会覆盖更新的修订。

键盘和快捷键候选配置会先编译或验证再启用。更新失败时，活动状态和保存文件都不会改变。
快捷键另外保存在 `~/.config/denial/shortcuts.json`，并会随默认项演变自动迁移。

## 实时显示器配置

打开 **Settings → 显示器与视频** 可以：

- 拖动显示器以设置逻辑桌面位置；
- 选择主显示器，或让 Denial 自动选择刷新率最高的已启用输出；
- 选择分辨率与刷新率；
- 在界面中设置 50–600% 缩放，包括小数缩放；
- 将显示器旋转 90°、180° 或 270°；
- 在连接器支持自适应同步时启用 VRR；以及
- 通过关联的内核背光或 DDC/CI 显示器控制亮度。

Denial 会把完整输出状态作为一个事务提交，在替换实时状态前通过 DRM/KMS 验证，并显示
十秒确认。选择**保留更改**会持久保存，选择**立即还原**会回滚；若未确认，会自动恢复
此前配置。渲染器替换或模式设置失败时也会回到保留的可用输出与 Flutter 资源。

显示器更改保存在：

```text
$XDG_CONFIG_HOME/denial/outputs.conf
```

第一次登录时会复制软件包模板，已有用户文件永不被替换。Settings 只重写其管理的连接器
指令，并保留无关注释和桌面布局条目。无法持久保存时，Settings 会明确标记为仅当前会话。

### 手动输出文件

没有连接器条目时，Denial 会发现显示器，从左到右自动排列，并在各自原生分辨率选择最快
模式。使用以下命令检查权威实时状态：

```sh
denialctl outputs
```

手动布局示例：

```ini
primary=eDP-1
eDP-1=0,0
mode=eDP-1,2560,1600,120000
scale=eDP-1,1.5
DP-1=1707,0
mode=DP-1,3840,2160,144000
transform=DP-1,90
vrr=DP-1
disabled=HDMI-A-1
system_bar=top,32,eDP-1+DP-1
maximize_padding=10
```

| 条目 | 含义 |
| --- | --- |
| `NAME=X,Y` | 把输出放在逻辑桌面坐标中 |
| `NAME=X,Y,HZ` | 同时按原生分辨率请求刷新率的旧式简写 |
| `primary=NAME` | 选择主显示器 |
| `mode=NAME,WIDTH,HEIGHT,MILLIHZ` | 选择精确模式；较小的刷新值也可按 Hz 解析 |
| `scale=NAME,SCALE` | 设置小数或整数缩放 |
| `transform=NAME,VALUE` | 使用 `normal`、`90`、`180`、`270` 或 `flipped-*` 变体 |
| `vrr=NAME` | 启用可变刷新率 |
| `disabled=NAME` | 让已连接输出不进入 KMS 与 Wayland 拓扑 |
| `system_bar=EDGE,SIZE[,OUTPUTS]` | 放置系统栏；用 `+` 连接多个输出 |
| `system_bar=hidden` | 隐藏系统栏 |
| `maximize_padding=PIXELS` | 在最大化窗口周围预留空间 |

优先使用事务化 Settings 界面。若手动编辑导致无法正常登录，请参阅
[恢复输出布局](/zh-cn/docs/control-and-recovery/#recover-an-output-layout)。

当 `iio-sensor-proxy` 提供加速度计时，Denial 可自动旋转内置的 `DSI-*`、`eDP-*` 和
`LVDS-*` 面板。配置的变换表示固定安装方向；传感器旋转是临时状态，不会写回
`outputs.conf`。

### 显示器缩放

坐标和窗口几何保持逻辑单位。Flutter 以各输出的物理目标分辨率渲染；支持小数缩放的
Wayland 客户端会收到当前输出的精确首选缩放。旧客户端会收到向上取整的整数缓冲缩放，
再被向下采样。

Xwayland 在整个会话中只能使用一个密度，因为单个 X 服务器无法让每个 X11 窗口拥有不同
坐标缩放。Denial 现在默认使用精确的小数桌面密度，因此支持 DPI 的 X11 应用可以直接以
125% 或 150% 渲染。若某套应用无法处理小数 X11 DPI，可在 `/etc/denial/session.conf`
中选择旧的整数放大兼容策略，然后重启会话：

```ini
DENIAL_XWAYLAND_SCALE_MODE=integer
```

有效值为 `fractional` 和 `integer`。

## 外观与应用主题

配色偏好会改变 Denial 的完整语义调色板。解析后的配色与强调色也会通过标准桌面 Settings
Portal 发布，因此支持 Portal 的应用可以跟随桌面外壳。**无偏好**会让 Denial 保持深色
后备，同时允许应用自行选择。

启动器默认让 Qt 应用使用基于 Portal 的主题提供器：

```text
QT_QPA_PLATFORMTHEME=xdgdesktopportal
```

继承值或 `/etc/denial/session.conf` 中的显式条目优先。Denial 不会重写 KDE 配置，也不会
强制某种控件样式。

光标选择遵循 XCursor 主题搜索路径。外观页面可选择导入的主题与物理尺寸；动画光标和
客户端提供的 Wayland 光标表面会保留自身热点与帧时序。

## 应用环境与自动启动

**Settings → 应用环境** 可为所有由 Denial 启动的进程定义字面变量，并按桌面文件 ID
设置可选差异。规则可以设置值、保留空字符串或隐藏继承变量。更改无需重启 Denial，会
影响之后从启动器和快捷键发起的启动。

应用目标会保留桌面文件身份，并同时获得默认规则和每应用规则。原始“程序”和“Shell
命令”目标只获得默认规则。这些规则不会修改 `deniald`、D-Bus 激活、systemd 服务或 XDG
自动启动条目。

在 systemd 管理的会话中，Denial 只会在合成器和初始输出准备就绪后启动标准
`xdg-desktop-autostart.target`。条目可使用 `OnlyShowIn=Denial;`。没有 systemd 用户
管理器的系统应使用自身会话服务机制；Denial 不会再实现第二套自动启动器。

## 机器级覆盖

管理员覆盖项应写入：

```text
/etc/denial/session.conf
```

启动器通常选择连接到启动显示器的 GPU。分离 GPU 的机器可以让一个设备负责显示控制，
另一个负责渲染：

```ini
DENIAL_DRM_DEVICE=/dev/dri/card0
DENIAL_RENDER_DEVICE=/dev/dri/renderD128
```

该文件还可覆盖 Flutter Bundle、输出配置路径、Qt 平台主题、Xwayland 缩放模式、桌面外壳
配置和原生日志。规范的 Denial 变量使用 `DENIAL_*` 前缀。旧 `DENIA_*` 拼写暂时仍作为
兼容别名；两者同时存在时 `DENIAL_*` 优先。

### 渲染器后备 {#renderer-fallback}

Impeller GLES 是默认渲染器。只在驱动特定的渲染问题下选择保留的 Skia/Ganesh 后备：

```ini
DENIAL_FLUTTER_RENDERER=skia
```

修改后需重启 Denial 会话。删除覆盖项或设为 `impeller` 即可恢复默认。单次受控启动可用
`denial-session --flutter-renderer skia`。
