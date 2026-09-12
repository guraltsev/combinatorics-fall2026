/* Persistent display choices for the secondary "On this page" navigation. */
(() => {
  const storageKey = "course-page-toc-display";
  const defaultMode = "expanded";
  const modes = new Set([defaultMode, "current", "top-level"]);

  function savedMode() {
    try {
      const value = localStorage.getItem(storageKey);
      return modes.has(value) ? value : defaultMode;
    } catch (_) {
      return defaultMode;
    }
  }

  function setup() {
    const toc = document.getElementById("pst-page-toc-nav");
    if (!toc) return;

    const toggle = document.getElementById("course-page-toc-display-toggle");
    const choices = document.querySelectorAll("[data-course-page-toc-mode]");
    const followButton = document.getElementById("course-page-toc-follow-current");
    let detached = false;
    let activeLink = null;
    let updatePending = false;

    function scrollContainer() {
      for (let element = toc.parentElement; element; element = element.parentElement) {
        const overflowY = getComputedStyle(element).overflowY;
        if (
          /auto|scroll|overlay/.test(overflowY)
          && element.scrollHeight > element.clientHeight
        ) {
          return element;
        }
      }
      return null;
    }

    function currentLink() {
      return toc.querySelector(".nav-link.active, .nav-link[aria-current=\"true\"]");
    }

    function updateFollowButton(link = currentLink()) {
      if (!followButton) return;
      followButton.hidden = !detached || !link;
    }

    function followCurrentSection() {
      const link = currentLink();
      const container = scrollContainer();
      if (!link || !container) return;

      const containerBounds = container.getBoundingClientRect();
      const linkBounds = link.getBoundingClientRect();
      const padding = 12;
      if (
        linkBounds.top >= containerBounds.top + padding
        && linkBounds.bottom <= containerBounds.bottom - padding
      ) {
        return;
      }

      const offset = linkBounds.top - containerBounds.top
        - (container.clientHeight - linkBounds.height) / 2;
      const maximum = container.scrollHeight - container.clientHeight;
      const top = Math.max(0, Math.min(maximum, container.scrollTop + offset));
      container.scrollTo({
        top,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }

    function syncCurrentSection({ forceFollow = false } = {}) {
      const link = currentLink();
      const changed = link !== activeLink;
      activeLink = link;
      if (link && (changed || forceFollow) && !detached) {
        followCurrentSection();
      }
      updateFollowButton(link);
    }

    function scheduleCurrentSectionSync() {
      if (updatePending) return;
      updatePending = true;
      requestAnimationFrame(() => {
        updatePending = false;
        syncCurrentSection();
      });
    }

    function detachFromCurrentSection() {
      if (!currentLink()) return;
      detached = true;
      updateFollowButton();
    }

    function reattachToCurrentSection() {
      detached = false;
      syncCurrentSection({ forceFollow: true });
    }

    function selectMode(mode, persist = false) {
      if (!modes.has(mode)) mode = defaultMode;
      toc.dataset.coursePageTocMode = mode;
      choices.forEach((choice) => {
        const selected = choice.dataset.coursePageTocMode === mode;
        choice.classList.toggle("active", selected);
        choice.setAttribute("aria-pressed", String(selected));
      });
      if (toggle) toggle.title = `On-this-page navigation: ${mode.replace("-", " ")}`;
      if (persist) {
        try { localStorage.setItem(storageKey, mode); } catch (_) {}
      }
      reattachToCurrentSection();
    }

    selectMode(savedMode());
    choices.forEach((choice) => {
      choice.addEventListener("click", () => selectMode(choice.dataset.coursePageTocMode, true));
    });

    // PyData's scroll spy owns the active class.  Observe it rather than
    // duplicating its heading-detection logic.
    new MutationObserver(scheduleCurrentSectionSync).observe(toc, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-current"],
    });

    document.addEventListener("wheel", (event) => {
      const container = scrollContainer();
      if (container && container.contains(event.target)) detachFromCurrentSection();
    }, { capture: true, passive: true });
    document.addEventListener("touchmove", (event) => {
      const container = scrollContainer();
      if (container && container.contains(event.target)) detachFromCurrentSection();
    }, { capture: true, passive: true });
    document.addEventListener("pointerdown", (event) => {
      const container = scrollContainer();
      if (container && container.contains(event.target) && !event.target.closest("a")) {
        detachFromCurrentSection();
      }
    }, { capture: true });
    document.addEventListener("keydown", (event) => {
      const container = scrollContainer();
      if (!container || !container.contains(event.target)) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        detachFromCurrentSection();
      }
    }, { capture: true });

    toc.addEventListener("click", (event) => {
      if (event.target.closest("a")) reattachToCurrentSection();
    });
    followButton?.addEventListener("click", reattachToCurrentSection);
    syncCurrentSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
