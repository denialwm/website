---
title: 入门
weight: 10
prev: /docs
next: using-denial
---

Denial 目前支持 **x86-64 架构的 Arch Linux**。官方软件包会安装合成器、与之匹配的
Flutter 引擎、桌面外壳、Xwayland 支持、UWSM 会话和 Portal 配置。

> [!WARNING]
> Denial 仍处于公开 Alpha 阶段。请保留另一个图形会话，以便在出现问题时仍能更新或
> 修复系统。

## 安装

引导式安装程序会验证 Denial 签名密钥的完整指纹、显示所有计划执行的更改，并在使用
`sudo` 前征求确认：

```sh
curl -fsSL https://install.denialwm.org | sh
```

> [!TIP]
> 安装程序会核对完整的 Denial 发布密钥指纹：
> `AE4108FA5E91E26BE0EE331E0F5B3AD16E023091`。

{{% details title="手动配置软件仓库" closed="true" %}}

如果不想使用安装程序，请自行下载并检查公钥：

```sh
key_file="$(mktemp)"
curl -fsSL \
  -o "$key_file" \
  https://denialwm.github.io/denial/denial-repo-key.asc
gpg --show-keys --with-fingerprint "$key_file"
```

只有当显示的指纹与上面的值完全一致时，才导入密钥并在本地信任它：

```sh
sudo pacman-key --add "$key_file"
sudo pacman-key --lsign-key AE4108FA5E91E26BE0EE331E0F5B3AD16E023091
rm "$key_file"
```

在 `/etc/pacman.conf` 的官方软件仓库之后添加以下部分：

```ini
[denial]
SigLevel = Required TrustedOnly
Server = https://denialwm.github.io/denial/$arch
```

{{% /details %}}

然后更新系统并安装 Denial：

```sh
sudo pacman -Syu denial
```

安装 `denial` 时会自动选择兼容的 `denial-flutter-engine` 软件包。

## 检查安装

退出当前桌面前，请运行：

```sh
denial-session --check
```

它会检查已安装的会话和图形环境，但不会启动另一个合成器。

## 启动 Denial

退出登录，在显示管理器中选择 **Denial**，然后登录。Denial 支持 SDDM；任何能显示已安装
Wayland 会话条目的显示管理器也都可以启动它。

默认情况下，桌面使用 Denial 与合成器集成的 Impeller GLES 后端渲染。Skia/Ganesh 仍可
作为驱动兼容性后备；如果首次启动时画面损坏或无法显示，请参阅
[渲染器后备](../configuration/#renderer-fallback)。

标准显示管理器会话启动时不会锁定。这是有意为之：显示管理器已经验证了你的身份，
因此立刻显示 Denial 锁屏通常只会要求重复输入一次密码。

### 自动登录与直接启动

如果会话管理器在未先验证用户身份的情况下启动 Denial，请启用启动锁定：

```sh
uwsm start -e -D Denial -- /usr/bin/denial-session --start-locked
```

`--start-locked` 会在 Flutter 启动前关闭 Denial 的原生安全门，因此第一个可见状态就是
由 PAM 支持的锁屏。这适用于 greetd 的 `initial_session`、自动登录或其他直接启动路径。
除非确实希望再次输入密码，否则不要将它添加到普通、已经验证身份的显示管理器条目中。

支持的会话启动模式如下：

| 调用方式 | 结果 |
| --- | --- |
| `denial-session` | 在显示管理器完成身份验证后启动打包的桌面 |
| `denial-session --check` | 检查安装和图形环境要求，但不启动合成器 |
| `denial-session --start-locked` | 启动时原生安全门和 Flutter 锁屏已经锁定 |

其他 `deniald` 命令行开关面向受控开发和诊断，而不是持久用户配置。运行
`deniald --help` 可查看已安装版本提供的选项。

在 Denial 中打开终端，并验证原生控制连接：

```sh
denialctl status
denialctl outputs
```

第一条命令报告合成器和 Flutter 桌面外壳的状态；第二条列出已连接输出的模式、位置、
缩放和电源状态。

## 更新或卸载

Denial 遵循 Arch 的常规完整系统升级流程：

```sh
sudo pacman -Syu
```

要卸载合成器及不再被其他软件包需要的依赖，请运行：

```sh
sudo pacman -Rns denial
```

如果安装了可选的实时开发环境，请同时卸载两个软件包：

```sh
sudo pacman -Rns denial-ui-development denial
```

卸载软件包不会删除用户配置或可编辑的 `~/DenialUI` 检出目录。
