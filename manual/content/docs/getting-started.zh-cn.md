---
title: 入门
weight: 10
prev: /docs
next: using-denial
---

Denial 为以下系统发布官方 **x86-64** 软件包：

- Arch Linux 及 CachyOS 等兼容发行版；
- Debian 13（trixie）；
- Ubuntu 24.04 LTS（noble）；
- Fedora 44。

| 架构 | 可正常运行 | 提供二进制软件包 |
| --- | :---: | :---: |
| x86-64 | ✅ | ✅ |
| ARM64（AArch64） | ✅ | ❌ |

ARM64 已得到完整支持，但尚未发布官方 ARM64 二进制软件包。ARM64 用户应从源代码构建
Denial，而不是使用下方的软件仓库配置流程。

原生软件包会安装合成器、与之匹配的 Flutter 引擎、桌面外壳、Xwayland 支持、UWSM
会话和 Portal 配置。

> [!WARNING]
> Denial 现处于公开 Beta 阶段。请保留另一个图形会话，以便在出现问题时仍能更新或
> 修复系统。

## 安装

引导式安装程序会检测受支持的发行版、验证 Denial 签名密钥的完整指纹、显示所有计划
执行的更改，并在使用 `sudo` 前征求确认：

```sh
curl -fsSL https://install.denialwm.org | sh
```

> [!TIP]
> 安装程序会核对完整的 Denial 发布密钥指纹：
> `AE4108FA5E91E26BE0EE331E0F5B3AD16E023091`。它只配置软件仓库，不会安装任何软件包。

配置完成后，用当前发行版的原生软件包管理器显式安装 Denial：

{{< tabs >}}

  {{< tab name="Arch / CachyOS" >}}
  ```sh
  sudo pacman -Syu denial
  ```
  {{< /tab >}}

  {{< tab name="Debian / Ubuntu" >}}
  ```sh
  sudo apt update && sudo apt install denial
  ```
  {{< /tab >}}

  {{< tab name="Fedora" >}}
  ```sh
  sudo dnf install denial
  ```
  {{< /tab >}}

{{< /tabs >}}

安装 `denial` 时会自动选择兼容的 `denial-flutter-engine` 软件包。

{{% details title="手动配置软件仓库" closed="true" %}}

如果不想使用安装程序，请自行下载并检查公钥。修改软件包管理器前，必须核对完整指纹，
不能只核对短密钥 ID：

```sh
key_fingerprint='AE4108FA5E91E26BE0EE331E0F5B3AD16E023091'
key_tmp="$(mktemp -d)"
trap 'rm -rf -- "$key_tmp"' EXIT

curl \
  --proto '=https' \
  --tlsv1.2 \
  --fail \
  --silent \
  --show-error \
  --location \
  --output "$key_tmp/denial-repo-key.asc" \
  https://denialwm.github.io/denial/denial-repo-key.asc

downloaded_fingerprint="$(
  gpg --batch --show-keys --with-colons --fingerprint \
    "$key_tmp/denial-repo-key.asc" \
    | awk -F: '$1 == "fpr" { print toupper($10); exit }'
)"
test "$downloaded_fingerprint" = "$key_fingerprint"
gpg --show-keys --with-fingerprint "$key_tmp/denial-repo-key.asc"
```

### Arch Linux 与 CachyOS

只有指纹检查通过后，才导入密钥并在本地信任它：

```sh
sudo pacman-key --add "$key_tmp/denial-repo-key.asc"
sudo pacman-key --lsign-key "$key_fingerprint"
```

在 `/etc/pacman.conf` 的官方软件仓库之后添加以下部分：

```ini
[denial]
SigLevel = Required TrustedOnly
Server = https://denialwm.github.io/denial/$arch
```

`Required TrustedOnly` 会要求 Pacman 验证软件仓库数据库和每个软件包的可信签名。

### Debian 13

将已验证的密钥安装为仅供此软件仓库使用的 APT 密钥环：

```sh
sudo install -d -m 0755 /etc/apt/keyrings
sudo install -m 0644 \
  "$key_tmp/denial-repo-key.asc" \
  /etc/apt/keyrings/denial.asc
```

创建 `/etc/apt/sources.list.d/denial.sources`：

```text
Types: deb
URIs: https://denialwm.github.io/denial/apt
Suites: trixie
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/denial.asc
```

### Ubuntu 24.04 LTS

按上面的方式将密钥安装到 `/etc/apt/keyrings/denial.asc`，然后创建
`/etc/apt/sources.list.d/denial.sources`：

```text
Types: deb
URIs: https://denialwm.github.io/denial/apt
Suites: noble
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/denial.asc
```

`Signed-By` 将该密钥的信任范围限制在 Denial 软件仓库。APT 会先验证已签名的
`InRelease` 元数据，再接受其中的软件包校验和。

### Fedora 44

安装并导入已验证的密钥：

```sh
sudo install -D -m 0644 \
  "$key_tmp/denial-repo-key.asc" \
  /etc/pki/rpm-gpg/RPM-GPG-KEY-denial
sudo rpmkeys --import /etc/pki/rpm-gpg/RPM-GPG-KEY-denial
```

创建 `/etc/yum.repos.d/denial.repo`：

```ini
[denial]
name=Denial public beta
baseurl=https://denialwm.github.io/denial/rpm/fedora/$releasever/$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-denial
skip_if_unavailable=0
```

`repo_gpgcheck=1` 会验证软件仓库元数据，`gpgcheck=1` 会验证每个 RPM 内嵌的签名。

{{% /details %}}

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

使用当前发行版的常规更新流程：

```sh
# Arch Linux 或 CachyOS
sudo pacman -Syu

# Debian 13 或 Ubuntu 24.04
sudo apt update && sudo apt upgrade

# Fedora 44
sudo dnf upgrade
```

使用对应的软件包管理器卸载 Denial：

```sh
# Arch Linux 或 CachyOS
sudo pacman -Rns denial

# Debian 13 或 Ubuntu 24.04
sudo apt remove denial

# Fedora 44
sudo dnf remove denial
```

可选的 `denial-ui-development` 软件包目前只面向 Arch 系发行版。卸载 Denial 不会删除
软件仓库配置、用户配置或可编辑的 `~/DenialUI` 检出目录。
