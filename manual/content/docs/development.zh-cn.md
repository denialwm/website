---
title: 开发
weight: 80
prev: architecture
---

源码树包含 `compositor/` 中的 Rust 合成器和 `dart_shell/` 中的 Flutter 桌面外壳。二者
一起构建并使用同一个版本。

## 从源码构建

在 x86-64 Arch 开发主机上，先为固定版本的工具链和 Rust 依赖执行一次引导：

```sh
tools/denial-pc bootstrap
```

然后检查主机、构建两个组件并运行各自的测试套件：

```sh
tools/denial-pc doctor
tools/denial-pc build
tools/denial-pc test
```

主要输出如下：

| 构件 | 位置 |
| --- | --- |
| 合成器 | `$XDG_CACHE_HOME/denial/pc-build/rust/release/deniald` |
| 原生控制客户端 | `$XDG_CACHE_HOME/denial/pc-build/rust/release/denialctl` |
| Flutter 发布 bundle | `dart_shell/build/linux/x64/release/bundle` |

引导过程需要网络。后续构建会复用固定版本的缓存。请运行 `tools/denial-pc doctor`，不要
猜测缺少的是哪一个 Smithay、DRM、GBM、EGL、libinput、udev 或 Xwayland 开发依赖。

## 测试本地会话

安装一个单独的开发会话条目：

```sh
tools/denial-pc install-session
```

退出登录并明确选择该条目。不再需要时将它删除：

```sh
tools/denial-pc remove-session
```

开发条目与打包的 Denial 会话相互独立，不会替换正在运行的合成器。

## 实时编辑 Flutter 桌面外壳

实时编辑是可选功能，不需要重新构建 Rust 合成器。安装版本匹配的开发环境：

```sh
sudo pacman -S denial-ui-development
denialctl ui setup
```

默认设置会：

1. 按软件包记录的源码修订版创建 `~/DenialUI`；
2. 用打包的工具链准备匹配的 JIT bundle；
3. 选择 `~/DenialUI/dart_shell` 作为工作区；
4. 用实时运行时替换优化后的桌面外壳。

如有需要，可向 `denialctl ui setup` 传入另一个绝对目标路径。

在 VSCodium 中打开所创建的 `dart_shell` 目录，然后启动 **Attach to Denial live UI**。
保存更改过的 Dart 文件会请求热重载，Flutter Inspector 仍然可用。

该附加配置刻意不支持调试器暂停、断点、单步执行或表达式求值：暂停桌面外壳 isolate
也会暂停可交互的桌面。更改原生 Rust 代码或 Flutter 引擎仍需正常构建并重启会话。

## 分析 Flutter 桌面外壳性能

要进行有代表性的性能测量，请从 Denial 检出目录构建并激活优化后的 AOT profile 桌面
外壳：

```sh
denial-ui prepare-profile /absolute/path/to/denial/dart_shell
denialctl ui workspace /absolute/path/to/denial/dart_shell
denialctl ui profile
```

这种模式保留优化后的 AOT 应用代码，同时启用 Flutter VM 服务、时间线事件、CPU 分析和
DevTools。它不同于 JIT 实时编辑模式。

使用以下命令启动浏览器 DevTools：

```sh
denial-ui attach-profile /absolute/path/to/denial/dart_shell
```

分析期间请让该命令保持运行。结束后使用以下命令恢复打包的发布版桌面外壳：

```sh
denialctl ui restore
```

安装或替换 `denial-ui-development` 后，请先重启一次 Denial 会话，再激活 profile 模式，
确保匹配的原生引擎被干净加载。

## 运行时控制

常用的开发命令如下：

```sh
denialctl ui status
denialctl ui setup [PATH]
denialctl ui workspace /absolute/path/to/dart_shell
denialctl ui live on
denialctl ui reload
denialctl ui restart
denialctl ui profile
denialctl ui restore
```

某些保留操作可能会报告其原生能力尚未实现。被拒绝的命令会返回清晰的错误，而不会假装
成功。

请始终准备好恢复命令：

```sh
denialctl ui restore
```

它会在不结束 Wayland 会话的情况下恢复打包的优化桌面外壳。

> [!CAUTION]
> 自定义 Flutter 桌面外壳是受信任的会话代码。它可以观察合成器状态，并调用官方桌面
> 外壳可用的每一个原生操作。请勿运行不受信任的桌面外壳源码。
