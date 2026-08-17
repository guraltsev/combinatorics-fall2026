/* Show matching section headings even when the query is shorter than half
 * of the heading text (for example, "grade" -> "Letter grades"). */
(() => {
  const originalPerformSearch = Search._performSearch;

  Search._performSearch = function (...args) {
    const results = originalPerformSearch.apply(this, args);
    const [query] = args;
    const queryLower = query.toLowerCase().trim();

    if (!queryLower) return results;

    const { alltitles, docnames, filenames, titles } = Search._index;
    const existing = new Set(
      results.map((result) => `${result[0]},${result[2]},${result[5]}`),
    );

    for (const [heading, matches] of Object.entries(alltitles)) {
      if (!heading.toLowerCase().includes(queryLower)) continue;

      for (const [file, id] of matches) {
        const anchor = id === null ? "" : `#${id}`;
        const key = `${docnames[file]},${anchor},${filenames[file]}`;
        if (existing.has(key)) continue;

        results.push([
          docnames[file],
          titles[file] === heading ? heading : `${titles[file]} > ${heading}`,
          anchor,
          null,
          Scorer.title,
          filenames[file],
          SearchResultKind.title,
        ]);
        existing.add(key);
      }
    }

    return results.sort(_orderResultsByScoreThenName);
  };
})();
