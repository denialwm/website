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
| `denialctl status` | 合成器、输出和 Flutter 运行时摘要 |
| `denialctl outputs` | 输出模式、位置、缩放、电源状态和配置序列号 |
| `denialctl ui status` | 所选界面工作区、运行模式、进度和错误 |
| `denialctl --json status` | 机器可读状态；`--json` 适用于所有命令 |

操作被拒绝或失败时，命令会返回非零状态。选择 JSON 输出时，诊断信息会写入标准错误。

## 控制套接字

客户端按以下顺序查找 Unix 套接字：

1. 通过 `--socket` 传入的路径；
2. `DENIAL_SOCKET`；
3. `$XDG_RUNTIME_DIR/denial/control.sock`。

正常会话创建的运行时目录权限为 `0700`，套接字权限为 `0600`。该套接字仅供会话用户使用。

如果脚本只需确认请求已被接受，可在操作中使用 `--no-wait`：

```sh
denialctl --no-wait ui restore
```

## 恢复打包的桌面外壳

如果编辑过的 Flutter 代码导致桌面无法使用，请打开终端或另一个虚拟终端并运行：

```sh
denialctl ui restore
```

原生合成器会将自定义运行时替换为打包的优化桌面外壳，同时保留 Wayland 客户端和显示器。

如果必须停止合成器本身，`Ctrl+Alt+Backspace` 会结束会话。请只将它用于紧急退出，因为
应用无法执行正常的保存流程。

## 恢复输出布局

先运行 `denialctl outputs`。如果手动编辑的布局导致无法正常登录，请停止 Denial 会话，
并用另一个名称保留该文件：

```sh
mv ~/.config/denial/outputs.conf ~/.config/denial/outputs.conf.bak
```

下次登录时，Denial 会从打包模板创建新的用户文件，并自动排列已连接的输出。

## 预检与日志

在另一个桌面会话中运行：

```sh
denial-session --check
```

查看当前启动周期的日志：

```sh
journalctl --user -b
```

如需临时增加原生日志，请在 `/etc/denial/session.conf` 中添加以下行，然后启动新的 Denial
会话：

```ini
DENIAL_RUST_LOG=deniald=debug,smithay=info
```

收集到所需诊断信息后请删除该覆盖项；详细的合成器日志可能增长得很快。
