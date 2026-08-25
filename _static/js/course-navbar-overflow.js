/* Put only desktop navigation links that do not fit into an accessible menu. */
(() => {
  const desktop = window.matchMedia("(min-width: 960px)");

  function setup(nav) {
    const list = nav.querySelector("[data-course-navbar-items]");
    const overflow = nav.querySelector("[data-course-navbar-overflow]");
    const button = nav.querySelector("[data-course-navbar-overflow-toggle]");
    const menu = nav.querySelector("[data-course-navbar-overflow-menu]");
    if (!list || !overflow || !button || !menu) return;

    const close = () => {
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    };

    const fit = () => {
      // Restore every item before measuring so links reappear when the header
      // grows, or after a responsive breakpoint change.
      while (menu.firstElementChild) list.append(menu.firstElementChild);
      close();
      overflow.hidden = true;

      if (!desktop.matches) return;

      // The button itself consumes space, so include it while deciding which
      // links need to move.  Move from the end and prepend to retain order.
      overflow.hidden = false;
      while (list.scrollWidth > list.clientWidth && list.lastElementChild) {
        menu.prepend(list.lastElementChild);
      }
      overflow.hidden = menu.childElementCount === 0;
    };

    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) close();
    });

    nav.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        button.focus();
      }
    });

    const observer = new ResizeObserver(fit);
    observer.observe(nav);
    // The navigation can remain at its previous flex width while the viewport
    // grows, which means observing the navigation alone does not always
    // trigger a fresh fit calculation.
    window.addEventListener("resize", fit);
    desktop.addEventListener("change", fit);
    fit();
  }

  function start() {
    const navs = document.querySelectorAll("#pst-header .course-navbar-nav");
    if (!navs.length) return;
    document.documentElement.classList.add("course-navbar-overflow-ready");
    navs.forEach(setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
