const translationCatalog = window.denialTranslations || {};
const supportedLocales = new Set(["en", "zh-CN"]);
let activeLocale = "en";

const normalizeLocale = (locale) => {
  const normalized = String(locale || "").toLowerCase();

  if (["zh", "zh-cn", "zh-sg", "zh-hans"].includes(normalized)) {
    return "zh-CN";
  }

  return "en";
};

const translation = (key, fallback) => {
  const value = key.split(".").reduce(
    (current, part) =>
      current && Object.prototype.hasOwnProperty.call(current, part)
        ? current[part]
        : undefined,
    translationCatalog[activeLocale],
  );

  return value === undefined ? fallback : value;
};

const formattedTranslation = (key, fallback, values = {}) => {
  let result = translation(key, fallback);

  Object.entries(values).forEach(([name, value]) => {
    result = result.replaceAll(`{${name}}`, value);
  });

  return result;
};

const localizedTextElements = document.querySelectorAll("[data-i18n]");
const localizedHtmlElements = document.querySelectorAll("[data-i18n-html]");
const localizedAriaElements = document.querySelectorAll("[data-i18n-aria]");
const localizedAltElements = document.querySelectorAll("[data-i18n-alt]");
const localizedGalleryItems = document.querySelectorAll("[data-i18n-gallery]");
const languagePicker = document.querySelector("[data-language-picker]");
const manualLinks = document.querySelectorAll("[data-manual-link]");
const discordLinks = document.querySelectorAll("[data-discord-link]");
const sponsorLinks = document.querySelectorAll("[data-sponsor-link]");
const pageDescription = document.querySelector('meta[name="description"]');
const openGraphTitle = document.querySelector('meta[property="og:title"]');
const openGraphDescription = document.querySelector(
  'meta[property="og:description"]',
);
const originalPageMetadata = {
  title: document.title,
  description: pageDescription?.content,
  ogTitle: openGraphTitle?.content,
  ogDescription: openGraphDescription?.content,
};

localizedTextElements.forEach((element) => {
  element.i18nOriginalText = element.textContent.trim();
});
localizedHtmlElements.forEach((element) => {
  element.i18nOriginalHtml = element.innerHTML;
});
localizedAriaElements.forEach((element) => {
  element.i18nOriginalAria = element.getAttribute("aria-label");
});
localizedAltElements.forEach((element) => {
  element.i18nOriginalAlt = element.getAttribute("alt");
});
localizedGalleryItems.forEach((item) => {
  item.i18nOriginalGallery = {
    title: item.dataset.galleryTitle,
    kind: item.dataset.galleryKind,
    aria: item.getAttribute("aria-label"),
  };
});

const pageMetaKey = () => {
  const page = document.body?.dataset?.page || "home";
  return `meta.${page}`;
};

const applyLocale = (locale, { persist = false, updateUrl = false } = {}) => {
  activeLocale = supportedLocales.has(locale) ? locale : "en";
  document.documentElement.lang = activeLocale;
  const metaRoot = pageMetaKey();
  document.title = translation(`${metaRoot}.title`, originalPageMetadata.title);

  if (pageDescription) {
    pageDescription.content = translation(
      `${metaRoot}.description`,
      originalPageMetadata.description,
    );
  }

  if (openGraphTitle) {
    openGraphTitle.content = translation(
      `${metaRoot}.title`,
      originalPageMetadata.ogTitle,
    );
  }

  if (openGraphDescription) {
    openGraphDescription.content = translation(
      `${metaRoot}.ogDescription`,
      originalPageMetadata.ogDescription,
    );
  }

  localizedTextElements.forEach((element) => {
    element.textContent = translation(
      element.dataset.i18n,
      element.i18nOriginalText,
    );
  });

  localizedHtmlElements.forEach((element) => {
    element.innerHTML = translation(
      element.dataset.i18nHtml,
      element.i18nOriginalHtml,
    );
  });

  localizedAriaElements.forEach((element) => {
    element.setAttribute(
      "aria-label",
      translation(element.dataset.i18nAria, element.i18nOriginalAria),
    );
  });

  localizedAltElements.forEach((element) => {
    element.setAttribute(
      "alt",
      translation(element.dataset.i18nAlt, element.i18nOriginalAlt),
    );
  });

  localizedGalleryItems.forEach((item) => {
    const key = item.dataset.i18nGallery;
    const original = item.i18nOriginalGallery;
    const title = translation(`${key}.title`, original.title);
    const kind = translation(`${key}.kind`, original.kind);
    item.dataset.galleryTitle = title;
    item.dataset.galleryKind = kind;
    item.setAttribute(
      "aria-label",
      formattedTranslation("gallery.open", original.aria, { title }),
    );
    item.querySelector(".gallery-item-title").textContent = title;
    item.querySelector(".gallery-item-kind").textContent = kind;
  });

  manualLinks.forEach((link) => {
    const path = (link.dataset.manualPath || "").replace(/^\//, "");
    link.href =
      activeLocale === "zh-CN"
        ? `https://manual.denialwm.org/zh-cn/${path}`
        : `https://manual.denialwm.org/${path}`;
  });

  discordLinks.forEach((link) => {
    link.href =
      activeLocale === "zh-CN"
        ? "https://discord.gg/PT2QvXrdF"
        : "https://discord.gg/vy5t8aCxj";
  });

  sponsorLinks.forEach((link) => {
    link.href =
      activeLocale === "zh-CN"
        ? "https://sponsor.denialwm.org/cn"
        : "https://sponsor.denialwm.org/en";
  });

  if (languagePicker) {
    languagePicker.value = activeLocale;
  }

  if (persist) {
    try {
      window.localStorage.setItem("denial-language", activeLocale);
    } catch {
      // Language selection still works when storage is unavailable.
    }
  }

  if (updateUrl) {
    const url = new URL(window.location.href);

    if (activeLocale === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", activeLocale);
    }

    window.history.replaceState({}, "", url);
  }
};

const requestedLocale = new URL(window.location.href).searchParams.get("lang");
let storedLocale;

try {
  storedLocale = window.localStorage.getItem("denial-language");
} catch {
  // Fall back to the browser language when storage is unavailable.
}

applyLocale(
  normalizeLocale(requestedLocale || storedLocale || navigator.language),
);

languagePicker?.addEventListener("change", (event) => {
  applyLocale(event.target.value, { persist: true, updateUrl: true });
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollbarFadeTimer;

const revealScrollbar = () => {
  document.documentElement.classList.add("is-scrolling");
  window.clearTimeout(scrollbarFadeTimer);
  scrollbarFadeTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("is-scrolling");
  }, 700);
};

document.addEventListener("scroll", revealScrollbar, {
  capture: true,
  passive: true,
});

const copyFallback = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
};

const installerDialog = document.getElementById("installer-dialog");
const installerDialogOpen = document.querySelector(
  "[data-installer-dialog-open]",
);
const installerDialogClose = document.querySelector(
  "[data-installer-dialog-close]",
);
const installerSource = document.getElementById("installer-source");
const installerCopyButton = document.querySelector(
  '[data-copy-target="installer-source"]',
);
const shellKeywords = new Set([
  "case",
  "do",
  "done",
  "else",
  "esac",
  "exit",
  "fi",
  "for",
  "if",
  "in",
  "return",
  "then",
]);
const shellTokenPattern =
  /"(?:[^"\\]|\\.)*"|'[^']*'|\$[A-Za-z_][A-Za-z0-9_]*|--?[A-Za-z][A-Za-z0-9-]*|\b(?:apt|case|command|curl|dnf|do|done|else|esac|exit|fi|for|gpg|grep|if|in|install|pacman-key|printf|return|rpmkeys|sudo|tee|then|uname)\b/g;
let installerSourceRequest;

const shellTokenClass = (token) => {
  if (token.startsWith('"') || token.startsWith("'")) {
    return "syntax-string";
  }

  if (token.startsWith("$")) {
    return "syntax-variable";
  }

  if (token.startsWith("-")) {
    return "syntax-option";
  }

  return shellKeywords.has(token) ? "syntax-keyword" : "syntax-command";
};

const renderInstallerSource = (source) => {
  if (!installerSource) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const normalizedSource = source.replace(/\r\n?/g, "\n").replace(/\n$/, "");

  normalizedSource.split("\n").forEach((line) => {
    const lineElement = document.createElement("span");
    lineElement.className = "code-line";

    if (line.trimStart().startsWith("#")) {
      const comment = document.createElement("span");
      comment.className = "syntax-comment";
      comment.textContent = line;
      lineElement.append(comment);
    } else {
      let cursor = 0;

      for (const match of line.matchAll(shellTokenPattern)) {
        lineElement.append(document.createTextNode(line.slice(cursor, match.index)));

        const token = document.createElement("span");
        token.className = shellTokenClass(match[0]);
        token.textContent = match[0];
        lineElement.append(token);
        cursor = match.index + match[0].length;
      }

      lineElement.append(document.createTextNode(line.slice(cursor)));
    }

    fragment.append(lineElement);
  });

  installerSource.replaceChildren(fragment);
  installerSource.removeAttribute("aria-busy");
  if (installerCopyButton) {
    installerCopyButton.disabled = false;
  }
};

const loadInstallerSource = () => {
  if (installerSourceRequest) {
    return;
  }

  installerSourceRequest = fetch("https://install.denialwm.org", {
    headers: { Accept: "text/plain" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Installer source request failed");
      }

      return response.text();
    })
    .then(renderInstallerSource)
    .catch(() => {
      if (installerSource) {
        const error = document.createElement("span");
        error.className = "code-line installer-source-error";
        error.textContent = translation(
          "installer.loadError",
          "Could not load the installer. Please try again.",
        );
        installerSource.replaceChildren(error);
        installerSource.removeAttribute("aria-busy");
      }
      installerSourceRequest = undefined;
    });
};

if (installerDialog && installerDialogOpen && installerDialogClose) {
  installerDialogOpen.addEventListener("click", () => {
    loadInstallerSource();
    installerDialog.showModal();
    document.body.classList.add("is-dialog-open");
  });

  installerDialogClose.addEventListener("click", () => installerDialog.close());

  installerDialog.addEventListener("close", () => {
    document.body.classList.remove("is-dialog-open");
  });

  installerDialog.addEventListener("click", (event) => {
    if (event.target !== installerDialog) {
      return;
    }

    const bounds = installerDialog.getBoundingClientRect();
    const clickIsOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickIsOutside) {
      installerDialog.close();
    }
  });
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);

    if (!target) {
      return;
    }

    const lines = target.querySelectorAll(":scope > .code-line");
    const text = lines.length
      ? Array.from(lines, (line) => line.textContent).join("\n").trim()
      : target.textContent.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        copyFallback(text);
      }

      const label = button.querySelector(".copy-label");
      button.classList.add("is-copied");
      label.textContent = translation("common.copied", "Copied");
      window.clearTimeout(button.copyResetTimer);
      button.copyResetTimer = window.setTimeout(() => {
        button.classList.remove("is-copied");
        label.textContent = translation("common.copy", "Copy");
      }, 2000);
    } catch {
      button.querySelector(".copy-label").textContent = translation(
        "common.tryAgain",
        "Try again",
      );
    }
  });
});

const galleryItems = Array.from(document.querySelectorAll("[data-gallery-item]"));
const galleryVideos = document.querySelectorAll("[data-gallery-video]");
const galleryDialog = document.querySelector("[data-gallery-dialog]");
const galleryNumberLabel = (number) => String(number).padStart(2, "0");
if (galleryDialog && galleryItems.length) {
  const galleryDialogStage = galleryDialog.querySelector(
    "[data-gallery-dialog-stage]",
  );
  const galleryDialogTitle = galleryDialog.querySelector(
    "[data-gallery-dialog-title]",
  );
  const galleryDialogKind = galleryDialog.querySelector(
    "[data-gallery-dialog-kind]",
  );
  const galleryDialogCurrent = galleryDialog.querySelector(
    "[data-gallery-dialog-current]",
  );
  const galleryDialogTotal = galleryDialog.querySelector(
    "[data-gallery-dialog-total]",
  );
  const galleryDialogPrevious = galleryDialog.querySelector(
    "[data-gallery-dialog-previous]",
  );
  const galleryDialogNext = galleryDialog.querySelector(
    "[data-gallery-dialog-next]",
  );
  const galleryDialogClose = galleryDialog.querySelector("[data-gallery-close]");
  let galleryDialogIndex = 0;
  let activeGallerySlide;
  let galleryIsTransitioning = false;
  let galleryTransitionToken = 0;

  const updateGalleryVideoLabel = (video, title) => {
    video.setAttribute(
      "aria-label",
      formattedTranslation(
        video.paused ? "gallery.playVideo" : "gallery.pauseVideo",
        `${video.paused ? "Play" : "Pause"} ${title} video`,
        { title },
      ),
    );
  };

  const createGallerySlide = (item) => {
    const slide = document.createElement("div");
    slide.className = "gallery-dialog-slide";
    const isVideo = item.dataset.galleryType === "video";
    let media;

    if (isVideo) {
      media = document.createElement("video");
      media.className = "gallery-dialog-media gallery-dialog-video";
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.poster = item.dataset.galleryPoster || "";
      media.src = item.dataset.gallerySrc;
      media.tabIndex = 0;
      updateGalleryVideoLabel(media, item.dataset.galleryTitle);

      media.addEventListener("play", () => {
        updateGalleryVideoLabel(media, item.dataset.galleryTitle);
      });
      media.addEventListener("pause", () => {
        updateGalleryVideoLabel(media, item.dataset.galleryTitle);
      });
      media.addEventListener("click", () => {
        if (media.paused) {
          media.play().catch(() => {});
        } else {
          media.pause();
        }
      });
      media.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          media.click();
        }
      });
    } else {
      media = document.createElement("img");
      media.className = "gallery-dialog-media gallery-dialog-image";
      media.src = item.dataset.gallerySrc;
      media.alt = item.dataset.galleryTitle;
    }

    slide.append(media);
    return { slide, media };
  };

  const discardGallerySlide = (gallerySlide) => {
    if (!gallerySlide) {
      return;
    }

    if (gallerySlide.media instanceof HTMLVideoElement) {
      gallerySlide.media.pause();
      gallerySlide.media.removeAttribute("src");
      gallerySlide.media.load();
    }

    gallerySlide.slide.remove();
  };

  const playGallerySlide = (gallerySlide) => {
    if (
      gallerySlide.media instanceof HTMLVideoElement &&
      !reducedMotion.matches
    ) {
      gallerySlide.media.play().catch(() => {});
    }
  };

  const showGalleryDialogItem = (index, direction = 0) => {
    if (galleryIsTransitioning) {
      return;
    }

    galleryDialogIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryDialogIndex];
    const incomingSlide = createGallerySlide(item);
    const transitionToken = ++galleryTransitionToken;

    galleryDialogTitle.textContent = item.dataset.galleryTitle;
    galleryDialogKind.textContent = item.dataset.galleryKind;
    galleryDialogCurrent.textContent = galleryNumberLabel(galleryDialogIndex + 1);

    if (!activeGallerySlide || direction === 0 || reducedMotion.matches) {
      discardGallerySlide(activeGallerySlide);
      galleryDialogStage.replaceChildren(incomingSlide.slide);
      activeGallerySlide = incomingSlide;
      playGallerySlide(activeGallerySlide);
      return;
    }

    galleryIsTransitioning = true;
    const outgoingSlide = activeGallerySlide;
    const enteringClass =
      direction > 0 ? "is-entering-next" : "is-entering-previous";
    const leavingClass =
      direction > 0 ? "is-leaving-next" : "is-leaving-previous";
    let transitionFinished = false;
    incomingSlide.slide.classList.add(enteringClass);
    galleryDialogStage.append(incomingSlide.slide);
    playGallerySlide(incomingSlide);

    const finishTransition = () => {
      if (transitionFinished || transitionToken !== galleryTransitionToken) {
        return;
      }

      transitionFinished = true;
      discardGallerySlide(outgoingSlide);
      activeGallerySlide = incomingSlide;
      galleryIsTransitioning = false;
    };

    incomingSlide.slide.addEventListener("transitionend", finishTransition, {
      once: true,
    });
    window.setTimeout(finishTransition, 560);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (transitionToken !== galleryTransitionToken) {
          return;
        }

        outgoingSlide.slide.classList.add(leavingClass);
        incomingSlide.slide.classList.remove(enteringClass);
      });
    });
  };

  const openGalleryDialog = (index) => {
    galleryVideos.forEach((video) => video.pause());
    galleryDialog.showModal();
    document.body.classList.add("is-dialog-open");
    showGalleryDialogItem(index);
  };

  const navigateGallery = (direction) => {
    showGalleryDialogItem(galleryDialogIndex + direction, direction);
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openGalleryDialog(index));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGalleryDialog(index);
      }
    });
  });

  galleryDialogTotal.textContent = galleryNumberLabel(galleryItems.length);
  galleryDialogPrevious.disabled = galleryItems.length < 2;
  galleryDialogNext.disabled = galleryItems.length < 2;
  galleryDialogPrevious.addEventListener("click", () => navigateGallery(-1));
  galleryDialogNext.addEventListener("click", () => navigateGallery(1));
  galleryDialogClose.addEventListener("click", () => galleryDialog.close());

  galleryDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateGallery(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateGallery(1);
    }
  });

  galleryDialog.addEventListener("click", (event) => {
    if (event.target !== galleryDialog) {
      return;
    }

    const bounds = galleryDialog.getBoundingClientRect();
    const clickIsOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickIsOutside) {
      galleryDialog.close();
    }
  });

  galleryDialog.addEventListener("close", () => {
    galleryTransitionToken += 1;
    galleryIsTransitioning = false;
    galleryDialogStage.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    activeGallerySlide = undefined;
    galleryDialogStage.replaceChildren();
    document.body.classList.remove("is-dialog-open");

    if (!reducedMotion.matches) {
      galleryVideos.forEach((video) => {
        const bounds = video.getBoundingClientRect();
        const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;

        if (isVisible) {
          video.play().catch(() => {});
        }
      });
    }
  });
}

const stage = document.querySelector(".stage");
const shotFrame = document.querySelector(".shot-frame");

if (stage && shotFrame && window.matchMedia("(pointer: fine)").matches) {
  stage.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const ratioY = (event.clientY - bounds.top) / bounds.height - 0.5;

    shotFrame.style.setProperty("--shot-ry", `${ratioX * 5}deg`);
    shotFrame.style.setProperty("--shot-rx", `${ratioY * -3.5}deg`);
  });

  stage.addEventListener("pointerleave", () => {
    shotFrame.style.setProperty("--shot-ry", "0deg");
    shotFrame.style.setProperty("--shot-rx", "0deg");
  });
}

if (
  galleryVideos.length &&
  !reducedMotion.matches &&
  "IntersectionObserver" in window
) {
  const galleryVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.35 },
  );

  galleryVideos.forEach((video) => galleryVideoObserver.observe(video));
}

const revealTargets = document.querySelectorAll("[data-reveal]");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((target) => target.classList.add("is-revealed"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const installSteps = document.querySelectorAll(".install-step");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  installSteps.forEach((step) => step.classList.add("is-active"));
} else {
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-active");
        stepObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0 },
  );

  installSteps.forEach((step) => stepObserver.observe(step));
}

const idleRegions = document.querySelectorAll("[data-idle]");

if (idleRegions.length && "IntersectionObserver" in window) {
  const idleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-idle", !entry.isIntersecting);
      });
    },
    { rootMargin: "120px" },
  );

  idleRegions.forEach((region) => idleObserver.observe(region));
}

const sponsorWalls = document.querySelectorAll("[data-sponsor-wall]");
const companyWalls = document.querySelectorAll("[data-company-wall]");

const sponsorLink = (sponsor, className, size) => {
  const link = document.createElement("a");
  const avatar = document.createElement("img");
  const name = document.createElement("span");
  link.href = sponsor.url;
  link.rel = "noopener";
  if (className) link.className = className;
  avatar.src = `${sponsor.avatar}${sponsor.avatar.includes("?") ? "&" : "?"}s=${size * 2}`;
  avatar.alt = "";
  avatar.width = size;
  avatar.height = size;
  avatar.loading = "lazy";
  name.textContent = sponsor.name || sponsor.login;
  link.append(avatar, name);
  return link;
};

if (sponsorWalls.length || companyWalls.length) {
  fetch("/data/sponsors.json")
    .then((response) => (response.ok ? response.json() : []))
    .then((sponsors) => {
      const companies = sponsors.filter((sponsor) => sponsor.org);
      const people = sponsors.filter((sponsor) => !sponsor.org);

      // Companies get their own row. The Support page keeps an open slot
      // in it; elsewhere the row only appears once a company sponsors.
      companyWalls.forEach((wall) => {
        companies.forEach((sponsor) => {
          const item = document.createElement("li");
          item.append(sponsorLink(sponsor, "sp-company", 56));
          wall.append(item);
        });
        if (wall.hasAttribute("data-company-invite")) {
          const invite = document.createElement("li");
          invite.innerHTML =
            '<a class="sp-company sp-company-invite" href="#companies"><span class="sp-company-plus" aria-hidden="true">+</span><span></span></a>';
          invite.querySelector("span:last-child").textContent = translation(
            "sponsorWall.company",
            "Your company here",
          );
          wall.append(invite);
        }
        if (wall.children.length) wall.hidden = false;
      });

      sponsorWalls.forEach((wall) => {
        people.forEach((sponsor) => {
          const item = document.createElement("li");
          item.append(sponsorLink(sponsor, "", 48));
          wall.append(item);
        });
        const invite = document.createElement("li");
        invite.className = "sp-wall-you";
        invite.innerHTML =
          '<a href="https://github.com/sponsors/doctorlogix" rel="noopener"><span class="sp-wall-plus" aria-hidden="true">+</span><span></span></a>';
        invite.querySelector("span:last-child").textContent = translation(
          "sponsorWall.you",
          "You?",
        );
        wall.append(invite);
      });
    })
    .catch(() => {});
}

const goalMeter = document.querySelector("[data-goal-meter]");

if (goalMeter) {
  fetch("/data/goal.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((goal) => {
      if (!goal || !(goal.target > 0)) return;
      const format = new Intl.NumberFormat(document.documentElement.lang, {
        style: "currency",
        currency: goal.currency || "EUR",
        maximumFractionDigits: 0,
      });
      const percent = Math.min(100, Math.round((goal.raised / goal.target) * 100));
      goalMeter.querySelector("[data-goal-raised]").textContent = format.format(goal.raised);
      goalMeter.querySelector("[data-goal-target]").textContent = format.format(goal.target);
      goalMeter.querySelector("[data-goal-bar]").setAttribute("aria-valuenow", percent);
      goalMeter.querySelector("[data-goal-fill]").style.width = `${percent}%`;
      goalMeter.hidden = false;
    })
    .catch(() => {});
}

/* Night sky
   - Far stars: baked once into a repeating tile, redrawn only on scroll
     (slow parallax).
   - Near stars: twinkle on a second canvas that idles at 24 fps and runs
     at full rate only while a meteor is crossing or the page scrolls.
   - Meteors: one shared direction per visit, like a shower, with the
     occasional pair and a rare fireball.
   - The nebula behind both is plain CSS (.atmosphere::before).
   Everything stops while the tab is hidden; reduced motion gets one
   still frame. */
const atmosphere = document.querySelector(".atmosphere");

if (atmosphere && "HTMLCanvasElement" in window) {
  const tileSize = 1024;
  const farDepth = 0.025;
  const nearDepth = 0.06;
  const idleInterval = 1000 / 24;
  const lowPower =
    (navigator.hardwareConcurrency || 8) <= 4 || navigator.connection?.saveData === true;

  const random = (min, max) => min + Math.random() * (max - min);
  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);

  // Mostly white, some blue-white and lavender, a few warm stars.
  const palette = [
    [0.5, "244 242 250"],
    [0.2, "202 218 255"],
    [0.16, "218 200 252"],
    [0.09, "255 234 210"],
    [0.05, "255 212 182"],
  ];
  const pickColor = () => {
    let roll = Math.random();
    for (const [weight, color] of palette) {
      roll -= weight;
      if (roll <= 0) return color;
    }
    return palette[0][1];
  };

  const glowSprite = (color) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const context = sprite.getContext("2d");
    const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, `rgb(${color} / 100%)`);
    glow.addColorStop(0.12, `rgb(${color} / 95%)`);
    glow.addColorStop(0.3, `rgb(${color} / 30%)`);
    glow.addColorStop(1, `rgb(${color} / 0%)`);
    context.fillStyle = glow;
    context.fillRect(0, 0, 32, 32);
    return sprite;
  };

  // Soft four-point glint for the few brightest stars.
  const glintSprite = (color) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const context = sprite.getContext("2d");
    const spike = (x0, y0, x1, y1) => {
      const line = context.createLinearGradient(x0, y0, x1, y1);
      line.addColorStop(0, `rgb(${color} / 0%)`);
      line.addColorStop(0.5, `rgb(${color} / 55%)`);
      line.addColorStop(1, `rgb(${color} / 0%)`);
      context.strokeStyle = line;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    };
    spike(32, 2, 32, 62);
    spike(2, 32, 62, 32);
    context.drawImage(glowSprite(color), 16, 16, 32, 32);
    return sprite;
  };

  const sprites = new Map(palette.map(([, color]) => [color, glowSprite(color)]));
  const glints = new Map(palette.map(([, color]) => [color, glintSprite(color)]));

  const sky = document.createElement("div");
  const farCanvas = document.createElement("canvas");
  const nearCanvas = document.createElement("canvas");
  const far = farCanvas.getContext("2d");
  const near = nearCanvas.getContext("2d");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  farCanvas.className = "sky-far";
  nearCanvas.className = "sky-near";
  sky.append(farCanvas, nearCanvas);
  atmosphere.prepend(sky);
  atmosphere.classList.add("has-sky");

  // Far stars: one seamless tile, filled as a pattern.
  let farPattern = null;
  let tileRatio = 0;
  const buildTile = (ratio) => {
    const tile = document.createElement("canvas");
    tile.width = tile.height = Math.round(tileSize * ratio);
    const context = tile.getContext("2d");
    context.scale(ratio, ratio);
    const count = lowPower ? 320 : 520;
    for (let index = 0; index < count; index += 1) {
      const magnitude = Math.random() ** 2.4;
      const size = 1.6 + magnitude * 3.4;
      const x = Math.random() * tileSize;
      const y = Math.random() * tileSize;
      context.globalAlpha = 0.16 + magnitude * 0.55;
      const sprite = sprites.get(pickColor());
      // Draw wrapped copies so stars on an edge continue on the next tile.
      for (const dx of [-tileSize, 0, tileSize]) {
        for (const dy of [-tileSize, 0, tileSize]) {
          context.drawImage(sprite, x + dx - size / 2, y + dy - size / 2, size, size);
        }
      }
    }
    farPattern = far.createPattern(tile, "repeat");
    tileRatio = ratio;
  };

  // Near stars live in normalized coordinates, so a resize rescales them
  // instead of reshuffling the sky.
  const nearStars = Array.from({ length: 280 }, () => {
    const magnitude = Math.random() ** 2.6;
    const color = pickColor();
    const restless = Math.random() < 0.12;
    return {
      x: Math.random(),
      y: Math.random(),
      size: 2.4 + magnitude * 6,
      alpha: 0.35 + magnitude * 0.65,
      amplitude: restless ? random(0.55, 0.85) : random(0.12, 0.38),
      speedA: random(0.5, 2.1),
      speedB: random(1.6, 4.4),
      phaseA: Math.random() * Math.PI * 2,
      phaseB: Math.random() * Math.PI * 2,
      sprite: sprites.get(color),
    };
  });
  const brightStars = Array.from({ length: 7 }, () => {
    const color = Math.random() < 0.7 ? palette[0][1] : pickColor();
    return {
      x: random(0.04, 0.96),
      y: random(0.03, 0.7),
      size: random(14, 24),
      alpha: random(0.55, 0.85),
      amplitude: random(0.1, 0.25),
      speedA: random(0.3, 0.8),
      speedB: random(1.1, 2.2),
      phaseA: Math.random() * Math.PI * 2,
      phaseB: Math.random() * Math.PI * 2,
      sprite: glints.get(color),
    };
  });

  let width = 0;
  let height = 0;
  let ratio = 1;
  let nearCount = 0;
  let scrollY = window.scrollY;

  const layout = () => {
    ratio = pixelRatio();
    width = window.innerWidth;
    height = window.innerHeight;
    for (const canvas of [farCanvas, nearCanvas]) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    near.setTransform(ratio, 0, 0, ratio, 0, 0);
    const area = width * height;
    nearCount = Math.round(Math.min(280, Math.max(70, area / 7600)) * (lowPower ? 0.6 : 1));
    if (ratio !== tileRatio) buildTile(ratio);
  };

  const parallax = (depth) => (reducedMotion.matches ? 0 : scrollY * depth);

  const drawFar = () => {
    far.setTransform(1, 0, 0, 1, 0, 0);
    far.clearRect(0, 0, farCanvas.width, farCanvas.height);
    const offset = (parallax(farDepth) * ratio) % (tileSize * ratio);
    farPattern.setTransform(new DOMMatrix([1, 0, 0, 1, 0, -offset]));
    far.fillStyle = farPattern;
    far.fillRect(0, 0, farCanvas.width, farCanvas.height);
  };

  const twinkle = (star, seconds) => {
    if (reducedMotion.matches) return star.alpha;
    const wave =
      0.6 * Math.sin(seconds * star.speedA + star.phaseA) +
      0.4 * Math.sin(seconds * star.speedB + star.phaseB);
    return star.alpha * (1 - (star.amplitude * (1 - wave)) / 2);
  };

  const drawStar = (star, seconds, offset) => {
    let y = star.y * height - offset;
    if (y < -star.size) y += height;
    near.globalAlpha = twinkle(star, seconds);
    const half = star.size / 2;
    near.drawImage(star.sprite, star.x * width - half, y - half, star.size, star.size);
  };

  // Meteors share one direction per visit, like a shower.
  const showerDirection = Math.random() < 0.5 ? -1 : 1;
  const showerAngle = random(0.38, 0.58);
  let meteors = [];
  let nextMeteorAt = 0;

  const spawnMeteor = (now, companion) => {
    const fireball = !companion && Math.random() < 0.12;
    const scale = Math.min(1.25, Math.max(0.6, Math.hypot(width, height) / 1800));
    const angle = (companion ? companion.angle : showerAngle) + random(-0.05, 0.05);
    const speed = random(1100, 1700) * scale * (fireball ? 0.7 : 1);
    const startX =
      showerDirection < 0 ? random(width * 0.35, width * 1.05) : random(width * -0.05, width * 0.65);
    const meteor = {
      angle,
      x: companion ? companion.x + random(-90, 90) : startX,
      y: companion ? companion.y + random(-40, 40) : random(height * -0.05, height * 0.42),
      dx: Math.cos(angle) * showerDirection,
      dy: Math.sin(angle),
      speed,
      length: random(110, 190) * scale * (fireball ? 1.8 : companion ? 0.75 : 1),
      width: fireball ? 2.6 : random(1.2, 1.7),
      color: fireball ? "214 236 255" : "244 242 250",
      fireball,
      born: now,
      life: fireball ? random(1100, 1450) : random(480, 820),
    };
    meteors.push(meteor);
    return meteor;
  };

  const drawMeteor = (meteor, now) => {
    const age = (now - meteor.born) / meteor.life;
    const travelled = ((now - meteor.born) / 1000) * meteor.speed;
    const headX = meteor.x + meteor.dx * travelled;
    const headY = meteor.y + meteor.dy * travelled;
    const length = meteor.length * Math.min(1, age / 0.35);
    const tailX = headX - meteor.dx * length;
    const tailY = headY - meteor.dy * length;
    let opacity = age < 0.12 ? age / 0.12 : age > 0.62 ? (1 - age) / 0.38 : 1;
    if (meteor.fireball) opacity = Math.min(1, opacity + 0.35 * Math.exp(-(((age - 0.55) / 0.08) ** 2)));
    const halfWidth = meteor.width / 2;
    const normalX = -meteor.dy * halfWidth;
    const normalY = meteor.dx * halfWidth;

    const trail = near.createLinearGradient(tailX, tailY, headX, headY);
    trail.addColorStop(0, `rgb(${meteor.color} / 0%)`);
    trail.addColorStop(0.65, `rgb(${meteor.color} / ${Math.round(opacity * 30)}%)`);
    trail.addColorStop(1, `rgb(${meteor.color} / ${Math.round(opacity * 95)}%)`);
    near.globalAlpha = 1;
    near.fillStyle = trail;
    near.beginPath();
    near.moveTo(tailX, tailY);
    near.lineTo(headX + normalX, headY + normalY);
    near.lineTo(headX - normalX, headY - normalY);
    near.closePath();
    near.fill();

    const glow = meteor.fireball ? 22 : 11;
    near.globalAlpha = opacity;
    near.drawImage(sprites.get(meteor.fireball ? "202 218 255" : palette[0][1]), headX - glow / 2, headY - glow / 2, glow, glow);
  };

  const drawNear = (now) => {
    const seconds = now / 1000;
    const offset = parallax(nearDepth) % height;
    near.clearRect(0, 0, width, height);
    for (let index = 0; index < nearCount; index += 1) {
      drawStar(nearStars[index], seconds, offset);
    }
    for (const star of brightStars) drawStar(star, seconds, offset);

    if (meteors.length) {
      near.globalCompositeOperation = "lighter";
      meteors = meteors.filter((meteor) => now - meteor.born < meteor.life);
      for (const meteor of meteors) drawMeteor(meteor, now);
      near.globalCompositeOperation = "source-over";
    }
    near.globalAlpha = 1;
  };

  let frameRequest = 0;
  let lastFrame = 0;
  let busyUntil = 0;
  let farDirty = true;

  const tick = (now) => {
    frameRequest = requestAnimationFrame(tick);
    const busy = meteors.length > 0 || now < busyUntil;
    if (!busy && now - lastFrame < idleInterval) return;
    lastFrame = now;

    if (now >= nextMeteorAt) {
      const meteor = spawnMeteor(now);
      if (!meteor.fireball && Math.random() < 0.15) {
        window.setTimeout(() => spawnMeteor(performance.now(), meteor), random(120, 380));
      }
      nextMeteorAt = now + random(4000, 11000);
    }
    if (farDirty) {
      drawFar();
      farDirty = false;
    }
    drawNear(now);
  };

  const start = () => {
    cancelAnimationFrame(frameRequest);
    drawFar();
    if (reducedMotion.matches) {
      meteors = [];
      drawNear(0);
      return;
    }
    nextMeteorAt = performance.now() + random(1800, 4500);
    frameRequest = requestAnimationFrame(tick);
  };

  layout();
  start();

  window.addEventListener(
    "scroll",
    () => {
      if (reducedMotion.matches) return;
      scrollY = window.scrollY;
      busyUntil = performance.now() + 220;
      farDirty = true;
    },
    { passive: true },
  );

  let resizeTimer;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Mobile address bars change the height while scrolling; ignore
      // small height-only changes so the sky doesn't flicker.
      const widthChanged = window.innerWidth !== lastWidth;
      const heightChanged = Math.abs(window.innerHeight - lastHeight) > 140;
      if (!widthChanged && !heightChanged && pixelRatio() === ratio) return;
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
      layout();
      drawFar();
      drawNear(performance.now());
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameRequest);
    } else {
      start();
    }
  });

  reducedMotion.addEventListener?.("change", start);
}

// Mobile page videos: hold the poster for reduced motion, and only play
// while it is on screen.
document.querySelectorAll(".mb-converge video, .mb-hero-tablet video, .mb-hero-phone video").forEach((video) => {
  if (reducedMotion.matches) {
    video.removeAttribute("autoplay");
    video.pause();
    return;
  }
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }).observe(video);
});
