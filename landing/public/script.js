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
const localizedWordElements = document.querySelectorAll("[data-i18n-words]");
const localizedGalleryItems = document.querySelectorAll("[data-i18n-gallery]");
const languagePicker = document.querySelector("[data-language-picker]");
const manualLinks = document.querySelectorAll("[data-manual-link]");
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
localizedWordElements.forEach((element) => {
  element.i18nOriginalWords = Array.from(
    element.querySelectorAll(":scope > .word"),
    (word) => word.textContent,
  );
});
localizedGalleryItems.forEach((item) => {
  item.i18nOriginalGallery = {
    title: item.dataset.galleryTitle,
    kind: item.dataset.galleryKind,
    aria: item.getAttribute("aria-label"),
  };
});

const applyLocale = (locale, { persist = false, updateUrl = false } = {}) => {
  activeLocale = supportedLocales.has(locale) ? locale : "en";
  document.documentElement.lang = activeLocale;
  document.title = translation("meta.title", originalPageMetadata.title);

  if (pageDescription) {
    pageDescription.content = translation(
      "meta.description",
      originalPageMetadata.description,
    );
  }

  if (openGraphTitle) {
    openGraphTitle.content = translation(
      "meta.title",
      originalPageMetadata.ogTitle,
    );
  }

  if (openGraphDescription) {
    openGraphDescription.content = translation(
      "meta.ogDescription",
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

  const activeGallerySubtitle = document.querySelector(
    "[data-gallery-subtitle].is-active",
  );
  document.querySelectorAll("[data-gallery-subtitle]").forEach((subtitle) => {
    subtitle.textContent =
      subtitle === activeGallerySubtitle
        ? translation(
            "gallery.subtitle",
            "Screenshots can’t capture how smooth Denial feels.",
          )
        : "";
  });

  localizedWordElements.forEach((element) => {
    const words = translation(
      element.dataset.i18nWords,
      element.i18nOriginalWords,
    );
    const separator = activeLocale === "zh-CN" ? "" : " ";
    const fragment = document.createDocumentFragment();

    words.forEach((word, index) => {
      if (index > 0) {
        fragment.append(document.createTextNode(separator));
      }

      const wordElement = document.createElement("span");
      wordElement.className = `word${
        index === words.length - 1 ? " word--accent" : ""
      }`;
      wordElement.style.setProperty("--i", index);
      wordElement.textContent = word;
      fragment.append(wordElement);
    });

    element.replaceChildren(fragment);
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
    link.href =
      activeLocale === "zh-CN"
        ? "https://manual.denialwm.org/zh-cn/"
        : "https://manual.denialwm.org/";
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
  /"(?:[^"\\]|\\.)*"|'[^']*'|\$[A-Za-z_][A-Za-z0-9_]*|--?[A-Za-z][A-Za-z0-9-]*|\b(?:case|command|do|done|else|esac|exit|fi|for|grep|if|in|pacman-key|printf|return|sudo|tee|then|uname)\b/g;
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
  installerCopyButton.disabled = false;
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
      const error = document.createElement("span");
      error.className = "code-line installer-source-error";
      error.textContent = translation(
        "installer.loadError",
        "Could not load the installer. Please try again.",
      );
      installerSource.replaceChildren(error);
      installerSource.removeAttribute("aria-busy");
      installerSourceRequest = undefined;
    });
};

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
const gallerySubtitleLines = Array.from(
  document.querySelectorAll("[data-gallery-subtitle]"),
);
const originalGallerySubtitles = [
  "Screenshots can’t capture how smooth Denial feels.",
  "Smoothness doesn’t fit in a screenshot.",
  "Some things only make sense in motion.",
  "A screenshot can show Denial. Motion makes it real.",
  "You have to see Denial move.",
  "Denial was made to be experienced in motion.",
];

if (gallerySubtitleLines.length === 2 && !reducedMotion.matches) {
  let gallerySubtitleIndex = 0;
  let activeGallerySubtitle = 0;
  let gallerySubtitleTimer;

  const rotateGallerySubtitle = () => {
    const outgoingLine = gallerySubtitleLines[activeGallerySubtitle];
    activeGallerySubtitle = activeGallerySubtitle === 0 ? 1 : 0;
    const incomingLine = gallerySubtitleLines[activeGallerySubtitle];
    const gallerySubtitles = translation(
      "gallery.subtitles",
      originalGallerySubtitles,
    );
    gallerySubtitleIndex = (gallerySubtitleIndex + 1) % gallerySubtitles.length;
    incomingLine.textContent = gallerySubtitles[gallerySubtitleIndex];
    outgoingLine.classList.remove("is-active");
    outgoingLine.classList.add("is-leaving");

    requestAnimationFrame(() => {
      incomingLine.classList.add("is-active");
    });

    window.setTimeout(() => {
      outgoingLine.classList.remove("is-leaving");
      outgoingLine.textContent = "";
    }, 650);
  };

  const startGallerySubtitleRotation = () => {
    if (gallerySubtitleTimer) {
      return;
    }

    gallerySubtitleTimer = window.setInterval(rotateGallerySubtitle, 4000);
  };

  const stopGallerySubtitleRotation = () => {
    window.clearInterval(gallerySubtitleTimer);
    gallerySubtitleTimer = undefined;
  };

  if ("IntersectionObserver" in window) {
    const gallerySubtitleObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startGallerySubtitleRotation();
      } else {
        stopGallerySubtitleRotation();
      }
    });

    gallerySubtitleObserver.observe(gallerySubtitleLines[0].parentElement);
  } else {
    startGallerySubtitleRotation();
  }
}

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
