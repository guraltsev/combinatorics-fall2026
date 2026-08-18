/* Shared collapse controls for the theme-emitted three-column course shell. */
(() => {
  function setup() {
    const layout = document.querySelector(".bd-container__inner");
    if (!layout) return;

    layout.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-course-sidebar-toggle]");
      if (!toggle) return;
      const side = toggle.dataset.courseSidebarToggle;
      const collapsed = layout.classList.toggle(`course-${side}-collapsed`);
      const isPrimary = side === "primary";
      toggle.setAttribute("aria-expanded", String(!collapsed));
      const label = collapsed
        ? (isPrimary ? "Show section navigation" : "Show on-this-page navigation")
        : (isPrimary ? "Collapse section navigation" : "Collapse on-this-page navigation");
      toggle.title = label;
      toggle.setAttribute("aria-label", label);
      toggle.innerHTML = collapsed
        ? (isPrimary ? "&rsaquo;" : "&lsaquo;")
        : (isPrimary ? "&lsaquo;" : "&rsaquo;");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
