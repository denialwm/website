---
title: Manual
next: getting-started
---

Denial is a Flutter-native Wayland compositor for supported x86-64 and ARM64
Linux systems. Its reference desktop is rendered by a directly embedded,
compositor-integrated Flutter Impeller pipeline. It is not a Flutter window
running inside somebody else's compositor. This manual covers installation,
everyday use, configuration, system integration, and development.

<div class="manual-support">
  <div class="support-message">
    <span class="support-eyebrow">Support independent development</span>
    <strong>Help Denial become what it can be.</strong>
    <p><span>If Denial matters to you, I would genuinely appreciate your support.</span><span>Your support gives me more focused time to build, polish, and keep it free for everyone.</span></p>
  </div>
  <div class="support-row">
    <a class="support-primary" href="http://sponsor.denialwm.org/en" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">✦</span> Support Denial directly <span aria-hidden="true">↗</span></a>
    <div class="support-actions">
      <span>Or use another platform:</span>
      <iframe src="https://github.com/sponsors/doctorlogix/button" title="Sponsor doctorlogix" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
      <a class="support-button" href="https://ko-fi.com/E5P523D5FN" target="_blank" rel="noopener noreferrer" title="Support Denial on Ko-fi">
        <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" aria-hidden="true">
        <span>Ko-fi</span>
      </a>
    </div>
  </div>
</div>

## Start here

{{< cards >}}
  {{< card link="/docs/getting-started/" title="Getting started" subtitle="Install Denial, run the preflight check, and start your first session." icon="play" >}}
  {{< card link="/docs/using-denial/" title="Using Denial" subtitle="Learn the desktop, window controls, keyboard shortcuts, and built-in tools." icon="desktop-computer" >}}
{{< /cards >}}

## Desktop and system

{{< cards >}}
  {{< card link="/docs/configuration/" title="Settings and displays" subtitle="Use the standalone Settings app for the shell, displays, input, appearance, and power." icon="adjustments" >}}
  {{< card link="/docs/system-services/" title="System services" subtitle="Audio, Wi-Fi, cellular, Bluetooth, authentication, power, and hardware integration." icon="puzzle" >}}
  {{< card link="/docs/screen-capture/" title="Screenshots and sharing" subtitle="Use built-in capture, direct tools, and desktop portals." icon="camera" >}}
{{< /cards >}}

## Maintain and understand

{{< cards >}}
  {{< card link="/docs/control-and-recovery/" title="Control and recovery" subtitle="Inspect a running session and recover from a broken shell or display setup." icon="terminal" >}}
  {{< card link="/docs/architecture/" title="Architecture" subtitle="Follow the embedded Flutter scene into independent per-output KMS pools." icon="cube" >}}
  {{< card link="/docs/development/" title="Development" subtitle="Build all runtime parts, live-edit the desktop, or create a custom shell." icon="code" >}}
{{< /cards >}}
