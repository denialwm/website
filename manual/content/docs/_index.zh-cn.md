---
title: 手册
next: getting-started
---

Denial 是一款面向受支持 x86-64 和 ARM64 Linux 系统的 Flutter 原生 Wayland 合成器。它的参考桌面由直接嵌入、
与合成器集成的 Flutter Impeller 管线渲染，而不是在其他合成器中运行的 Flutter 窗口。
本手册涵盖安装、日常使用、配置、系统集成和开发。

> [!WARNING]
> Denial 目前处于公开 Beta 阶段。评估时请保留另一个可用的桌面会话，并做好配置和
> 内部接口继续演变的准备。

<div class="manual-support">
  <p>独立开发，并将始终保持自由开源。</p>
  <div class="support-actions">
    <iframe src="https://github.com/sponsors/doctorlogix/button" title="Sponsor doctorlogix" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
    <a class="support-button" href="https://ko-fi.com/E5P523D5FN" target="_blank" rel="noopener noreferrer" title="在 Ko-fi 上支持 Denial">
      <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" aria-hidden="true">
      <span>Ko-fi</span>
    </a>
  </div>
</div>

## 从这里开始

{{< cards >}}
  {{< card link="getting-started/" title="入门" subtitle="安装 Denial、运行预检并启动第一个会话。" icon="play" >}}
  {{< card link="using-denial/" title="使用 Denial" subtitle="了解桌面、窗口控制、键盘快捷键和内置工具。" icon="desktop-computer" >}}
{{< /cards >}}

## 桌面与系统

{{< cards >}}
  {{< card link="configuration/" title="设置与显示器" subtitle="配置桌面外壳、输出、系统栏、动画和电源行为。" icon="adjustments" >}}
  {{< card link="system-services/" title="系统服务" subtitle="音频、网络、蓝牙、媒体、电源和硬件集成。" icon="puzzle" >}}
  {{< card link="screen-capture/" title="截图与共享" subtitle="使用直接捕获工具和桌面 Portal。" icon="camera" >}}
{{< /cards >}}

## 维护与原理

{{< cards >}}
  {{< card link="control-and-recovery/" title="控制与恢复" subtitle="检查正在运行的会话，并从损坏的桌面外壳或显示布局中恢复。" icon="terminal" >}}
  {{< card link="architecture/" title="架构" subtitle="理解 Rust、Smithay 和嵌入式 Flutter 桌面外壳之间的边界。" icon="cube" >}}
  {{< card link="development/" title="开发" subtitle="构建、测试并实时编辑 Flutter 桌面。" icon="code" >}}
{{< /cards >}}
