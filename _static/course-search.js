(() => {
  function setup() {
  const dialog = document.querySelector("#pst-search-dialog");
  const form = dialog?.querySelector("form.bd-search");
  const input = form?.querySelector("input[name=q]");
  if (!dialog || !form || !input) return;

  dialog.classList.add("single-page-search-dialog");
  input.setAttribute("aria-controls", "single-page-search-results");
  input.setAttribute("aria-describedby", "single-page-search-help");
  input.placeholder = "Search the entire course …";
  form.insertAdjacentHTML("afterend", `
    <section class="single-page-search-panel" aria-label="Search results">
      <div class="single-page-search-summary">
        <p id="single-page-search-status" role="status" aria-live="polite">Start typing to search every page in this course.</p>
        <p id="single-page-search-help">Use ↑ and ↓ to move through results, then Enter to open one.</p>
      </div>
      <ol id="single-page-search-results" class="single-page-search-results"></ol>
    </section>`);

  const status = dialog.querySelector("#single-page-search-status");
  const results = dialog.querySelector("#single-page-search-results");
  const normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const compact = (value) => value.replace(/\s+/g, " ").trim();
  const portable = Boolean(document.querySelector("template[data-single-page-content]"));
  const index = (globalThis.COURSE_SEARCH_INDEX || []).map((entry) => ({
    ...entry,
    normalized: normalize(`${entry.pageTitle} ${entry.heading} ${entry.text}`),
  }));

  function score(entry, query, terms) {
    if (!terms.every((term) => entry.normalized.includes(term))) return 0;
    const title = normalize(entry.pageTitle);
    const heading = normalize(entry.heading);
    let value = entry.normalized.includes(query) ? 30 : 0;
    for (const term of terms) {
      if (title.includes(term)) value += 18;
      if (heading.includes(term)) value += 12;
      let position = -1;
      while ((position = entry.normalized.indexOf(term, position + 1)) !== -1) value += 1;
    }
    return value;
  }

  function excerpt(entry, query, terms) {
    const plain = compact(entry.text);
    const normalized = normalize(plain);
    // Prefer the full query: otherwise a common early word (such as
    // "counting" in "double counting") can produce an unrelated excerpt.
    let match = normalized.indexOf(query);
    if (match < 0) {
      const positions = terms.map((term) => normalized.indexOf(term)).filter((position) => position >= 0);
      match = positions.length ? Math.min(...positions) : 0;
    }
    const start = Math.max(0, match - 75);
    const end = Math.min(plain.length, match + 190);
    return `${start ? "…" : ""}${plain.slice(start, end).trim()}${end < plain.length ? "…" : ""}`;
  }

  function appendHighlighted(parent, value, terms) {
    const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "giu");
    for (const part of value.split(pattern)) {
      if (!part) continue;
      if (terms.includes(normalize(part))) {
        const mark = document.createElement("mark");
        mark.textContent = part;
        parent.append(mark);
      } else {
        parent.append(document.createTextNode(part));
      }
    }
  }

  function render() {
    const rawQuery = compact(input.value);
    results.replaceChildren();
    if (rawQuery.length < 2) {
      status.textContent = rawQuery ? "Type at least two characters to search." : "Start typing to search every page in this course.";
      return;
    }
    const query = normalize(rawQuery);
    const terms = [...new Set(query.split(/\s+/).filter(Boolean))];
    const matches = index
      .map((entry) => ({ entry, score: score(entry, query, terms) }))
      .filter((match) => match.score)
      .sort((a, b) => b.score - a.score || a.entry.pageTitle.localeCompare(b.entry.pageTitle));
    status.textContent = `${matches.length} ${matches.length === 1 ? "section" : "sections"} found for “${rawQuery}”.`;
    for (const { entry } of matches) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const anchor = entry.anchor ? `#${encodeURIComponent(entry.anchor)}` : "";
      link.href = portable
        ? `#document-${entry.pageId}${entry.anchor ? `::${encodeURIComponent(entry.anchor)}` : ""}`
        : `${document.documentElement.dataset.content_root || "./"}${entry.pageId}.html${anchor}`;
      link.className = "single-page-search-result";
      const context = document.createElement("span");
      context.className = "single-page-search-result__page";
      context.textContent = entry.pageTitle;
      const heading = document.createElement("span");
      heading.className = "single-page-search-result__heading";
      appendHighlighted(heading, entry.heading, terms);
      const snippet = document.createElement("span");
      snippet.className = "single-page-search-result__excerpt";
      appendHighlighted(snippet, excerpt(entry, query, terms), terms);
      link.append(context, heading, snippet);
      item.append(link);
      results.append(item);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
    results.querySelector("a")?.focus();
  });
  input.addEventListener("input", render);
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(results.querySelectorAll("a"));
    if (!links.length) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const next = event.key === "ArrowDown"
      ? Math.min(current + 1, links.length - 1)
      : (current < 0 ? links.length - 1 : Math.max(current - 1, 0));
    links[next].focus();
  });
  results.addEventListener("click", (event) => {
    if (event.target.closest("a")) dialog.close();
  });

  const initialQuery = new URLSearchParams(location.search).get("q");
  if (initialQuery) {
    input.value = initialQuery;
    if (!dialog.open) dialog.showModal();
    render();
  }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
