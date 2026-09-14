---
title: 控制与恢复
weight: 60
prev: screen-capture
next: architecture
---

`denialctl` 直接与原生合成器通信，不依赖 Flutter 桌面外壳是否可见或有响应，因此既适合
检查，也适合恢复。

## 检查会话

| 命令 | 结果 |
| --- | --- |
| `denialctl status` | Flutter 运行时世代与活动输出摘要 |
| `denialctl outputs` | 连接器、模式、刷新率、位置、缩放、电源状态和配置序列号 |
| `denialctl ui status` | 所选界面工作区、运行模式、进度和错误 |
| `denialctl --json status` | 机器可读状态；`--json` 适用于所有命令 |

操作被拒绝或失败时，命令会返回非零状态。选择 JSON 输出时，诊断信息会写入标准错误。
`denialctl` 只检查输出；请使用独立 Settings 应用排列显示器、选择模式与缩放或启用
自适应同步。显示更改会实时测试，如果十秒内没有确认则自动回滚。

## 控制套接字

客户端按以下顺序查找 Unix 套接字：

1. 通过 `--socket` 传入的路径；
2. `DENIAL_SOCKET`；
3. `$XDG_RUNTIME_DIR/denial/control.sock`。

正常会话创建的运行时目录权限为 `0700`，套接字权限为 `0600`。该套接字仅供会话用户
使用。

如果脚本只需确认运行时请求已被接受，可使用 `--no-wait`：

```sh
denialctl --no-wait ui restore
```

## 恢复打包的桌面外壳

如果编辑过的 Flutter 代码导致桌面无法使用，请打开终端或另一个虚拟终端并运行：

```sh
denialctl ui restore
```

原生合成器会将自定义运行时替换为打包的优化桌面外壳，同时保留 Wayland 客户端和显示器。
如果上一个自定义 bundle 可用，也可用 `denialctl ui revert` 重新选择它。

如果必须停止合成器本身，`Ctrl+Alt+Backspace` 会结束会话。请只将它用于紧急退出，因为
应用无法执行正常的保存流程。

## 恢复输出布局 {#recover-an-output-layout}

“显示器”页面提供最安全的恢复路径：未确认的更改会在十秒后返回上一个可用配置。如果
手动编辑的布局导致无法正常登录，请停止 Denial 会话，并用另一个名称保留该文件：

```sh
mv ~/.config/denial/outputs.conf ~/.config/denial/outputs.conf.bak
```

下次登录时，会话启动器会从打包模板创建新的用户文件，并自动排列已连接的输出。

## 恢复设置与快捷键

通用桌面外壳设置存储在 `~/.config/denial/settings.json`。文件无效时，Denial 会使用
安全的内存默认值，并保留坏文件以便检查。停止会话后把它移开，Denial 即可创建新文档：

```sh
mv ~/.config/denial/settings.json ~/.config/denial/settings.json.bak
```

原生快捷键存储在 `~/.config/denial/shortcuts.json`。如果启动时无法解析或验证该文件，
Denial 会自动将其重命名为 `shortcuts.invalid-*.json` 备份，并恢复默认值。

## 预检与日志

登录图形会话前，可以运行与其相同的检查：

```sh
denial-session --check
```

报告会解析合成器、控制客户端、Flutter bundle、输出配置、显示与渲染设备、桌面外壳
配置、Flutter 渲染器、Xwayland 缩放模式、Qt 平台主题及 Xwayland 可执行文件。通常应先
处理失败行，而不是尝试启动不完整的会话。

使用 systemd 用户会话时，可检查当前启动周期：

```sh
journalctl --user -b
```

在非 systemd 安装上，请改看显示管理器或会话启动器日志。如需临时增加原生日志，请在
`/etc/denial/session.conf` 中添加以下行，然后启动新的 Denial 会话：

```ini
DENIAL_RUST_LOG=deniald=debug,smithay=info
```

收集到所需诊断信息后请删除该覆盖项；详细的合成器日志可能增长得很快。
