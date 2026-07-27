---
title: Denial Manual
toc: false
---

<div class="denial-home">
  <section class="denial-hero">
    <h1 class="denial-sr-only">Denial</h1>
    <p class="denial-eyebrow">A Flutter-native Wayland compositor</p>
    <img
      class="denial-wordmark denial-wordmark-light"
      src="/images/denial.svg"
      alt=""
      width="484"
      height="144"
    >
    <img
      class="denial-wordmark denial-wordmark-dark"
      src="/images/denial-dark.svg"
      alt=""
      width="484"
      height="144"
    >
    <p class="denial-lead">
      <strong>Origin does not have to dictate purpose.</strong>
      Denial places Flutter inside the compositor itself, where it owns the
      desktop shell, its motion, and the composition of Wayland applications.
    </p>
    <div class="denial-actions">
      <a class="denial-button denial-button-primary" href="/docs/">
        Enter the manual
      </a>
      <a class="denial-button" href="https://denialwm.org/">
        Visit the website
      </a>
    </div>
  </section>

  <figure class="denial-desktop">
    <img
      src="/images/desktop.webp"
      alt="A development build of the Denial desktop with a terminal and settings window"
      width="1600"
      height="900"
    >
  </figure>
</div>

## One compositor, two clear responsibilities

<p class="denial-section-intro">
Rust and Smithay own native compositor state. An embedded, AOT-compiled
Flutter shell owns the visible desktop policy. Wayland clients become external
textures inside that scene.
</p>

<div class="denial-flow" aria-label="Denial composition pipeline">
  <span>Wayland clients</span>
  <span class="denial-flow-arrow">→</span>
  <span>Rust / Smithay</span>
  <span class="denial-flow-arrow">→</span>
  <span>external textures</span>
  <span class="denial-flow-arrow">→</span>
  <span>Flutter scene</span>
</div>

{{< cards cols="3" >}}
  {{< card link="docs/getting-started" title="Get started" subtitle="Current status, installation paths, and where to begin." icon="play" >}}
  {{< card link="docs/architecture" title="Architecture" subtitle="How the native compositor and Flutter shell fit together." icon="cube" >}}
  {{< card link="https://github.com/denialwm/denial" title="Source code" subtitle="Follow development, read the full docs, or contribute." icon="github" >}}
{{< /cards >}}
