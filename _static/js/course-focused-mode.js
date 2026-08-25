/* URL-owned focused section presentation. */
(() => {
  "use strict";

  const body = () => document.body;
  let context = null;

  function readContext() {
    const node = body();
    if (!node) return null;
    let targets = {};
    try { targets = JSON.parse(node.dataset.focusSectionTargets || "{}"); } catch (_) {}
    return {
      root: node.dataset.focusSectionRoot || "",
      docname: node.dataset.courseDocname || "",
      documents: new Set((node.dataset.focusSectionDocuments || "").split(",").filter(Boolean)),
      targets,
    };
  }

  function splitUrl(url) {
    return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "") + url.hash;
  }

  function withFocus(value, enabled) {
    const params = new URLSearchParams(value.search);
    params.delete("focus");
    if (enabled) params.append("focus", "");
    const query = params.toString();
    // URLSearchParams has no bare-parameter form; emit the canonical ?focus.
    const search = enabled
      ? `${query.slice(0, -"focus=".length)}focus`
      : query;
    return value.pathname + (search ? `?${search}` : "") + value.hash;
  }

  function targetDoc(url, raw, link) {
    if (!context) return null;
    if (link.dataset.courseFocusTargetId) return link.dataset.courseFocusTargetId;
    if (raw.startsWith("#document-")) {
      const id = raw.slice("#document-".length).split("::", 1)[0];
      return context.documents.has(id) ? id : null;
    }
    for (const [docname, target] of Object.entries(context.targets)) {
      if (!target) continue;
      const expected = new URL(target, location.href);
      if (url.pathname === expected.pathname) return docname;
    }
    return null;
  }

  function decorateLinks() {
    if (!context || !context.root || !document.documentElement.classList.contains("course-focused")) return;
    document.querySelectorAll("a[href]").forEach((link) => {
      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#") || link.hasAttribute("download") || /^(?:[a-z][a-z+.-]*:|\/\/)/i.test(raw)) return;
      let url;
      try { url = new URL(raw, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      const docname = targetDoc(url, raw, link);
      if (!docname && !/\.html(?:$|[?#])/i.test(raw)) return;
      const next = withFocus(url, Boolean(docname && context.documents.has(docname)));
      if (link.getAttribute("href") !== next) link.setAttribute("href", next);
    });
  }

  function updateButton(focused) {
    const button = document.querySelector("[data-course-focus-toggle]");
    if (!button) return;
    const label = focused ? "Exit focused view" : "Focus this section";
    button.setAttribute("data-bs-original-title", label);
    button.setAttribute("aria-label", label);
  }

  function apply(nextContext) {
    context = nextContext || readContext();
    const requested = new URLSearchParams(location.search).has("focus");
    const eligible = Boolean(context?.root);
    if (!eligible && requested) history.replaceState(null, "", withFocus(new URL(location.href), false));
    if (eligible && requested) {
      const canonical = withFocus(new URL(location.href), true);
      if (canonical !== location.pathname + location.search + location.hash) history.replaceState(null, "", canonical);
    }
    const focused = eligible && requested;
    document.documentElement.classList.toggle("course-focused", focused);
    document.documentElement.classList.remove("course-focus-requested");
    updateButton(focused);
    decorateLinks();
  }

  function toggle() {
    if (!context?.root) return;
    const button = document.querySelector("[data-course-focus-toggle]");
    button?.blur();
    globalThis.bootstrap?.Tooltip?.getInstance(button)?.hide();
    const url = new URL(location.href);
    const next = withFocus(url, !new URLSearchParams(url.search).has("focus"));
    history.pushState(null, "", next);
    apply(context);
  }

  function start() {
    try {
      document.addEventListener("click", (event) => {
        const button = event.target.closest?.("[data-course-focus-toggle]");
        if (button) { event.preventDefault(); toggle(); }
      });
      window.addEventListener("popstate", () => apply(readContext()));
      window.addEventListener("course:virtualpagechange", (event) => apply(event.detail || readContext()));
      new MutationObserver(() => decorateLinks()).observe(document.body, { childList: true, subtree: true });
      apply(readContext());
    } catch (_) {
      document.documentElement.classList.remove("course-focus-requested", "course-focused");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
