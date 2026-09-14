---
title: 手册
next: getting-started
---

Denial 是一款面向受支持 x86-64 和 ARM64 Linux 系统的 Flutter 原生 Wayland 合成器。
它的参考桌面由直接嵌入、与合成器集成的 Flutter Impeller 管线渲染，而不是在其他
合成器中运行的 Flutter 窗口。
本手册涵盖安装、日常使用、配置、系统集成和开发。

<div class="manual-support">
  <div class="support-message">
    <span class="support-eyebrow">支持独立开发</span>
    <strong>帮助 Denial 成为它能够成为的样子。</strong>
    <p><span>如果 Denial 对你有所帮助，我会由衷感谢你的支持。</span><span>你的支持让我能投入更多专注的时间继续开发、打磨，并让它始终对所有人自由开放。</span></p>
  </div>
  <div class="support-row">
    <a class="support-primary" href="http://sponsor.denialwm.org/cn" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">✦</span> 直接支持 Denial <span aria-hidden="true">↗</span></a>
    <div class="support-actions">
      <span>也可以通过其他平台：</span>
      <iframe src="https://github.com/sponsors/doctorlogix/button" title="Sponsor doctorlogix" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
      <a class="support-button" href="https://ko-fi.com/E5P523D5FN" target="_blank" rel="noopener noreferrer" title="在 Ko-fi 上支持 Denial">
        <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" aria-hidden="true">
        <span>Ko-fi</span>
      </a>
    </div>
  </div>
</div>

## 从这里开始

{{< cards >}}
  {{< card link="getting-started/" title="入门" subtitle="安装 Denial、运行预检并启动第一个会话。" icon="play" >}}
  {{< card link="using-denial/" title="使用 Denial" subtitle="了解桌面、窗口控制、键盘快捷键和内置工具。" icon="desktop-computer" >}}
{{< /cards >}}

## 桌面与系统

{{< cards >}}
  {{< card link="configuration/" title="设置与显示器" subtitle="使用独立 Settings 应用配置桌面外壳、显示器、输入、外观与电源。" icon="adjustments" >}}
  {{< card link="system-services/" title="系统服务" subtitle="音频、Wi-Fi、蜂窝网络、蓝牙、认证、电源和硬件集成。" icon="puzzle" >}}
  {{< card link="screen-capture/" title="截图与共享" subtitle="使用内置捕获、直接工具和桌面 Portal。" icon="camera" >}}
{{< /cards >}}

## 维护与原理

{{< cards >}}
  {{< card link="control-and-recovery/" title="控制与恢复" subtitle="检查正在运行的会话，并从损坏的桌面外壳或显示布局中恢复。" icon="terminal" >}}
  {{< card link="architecture/" title="架构" subtitle="了解嵌入式 Flutter 场景如何进入独立的按输出 KMS 缓冲池。" icon="cube" >}}
  {{< card link="development/" title="开发" subtitle="构建全部运行时组件、实时编辑桌面或创建自定义桌面外壳。" icon="code" >}}
{{< /cards >}}
