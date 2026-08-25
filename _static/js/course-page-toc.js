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
    }

    selectMode(savedMode());
    choices.forEach((choice) => {
      choice.addEventListener("click", () => selectMode(choice.dataset.coursePageTocMode, true));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
