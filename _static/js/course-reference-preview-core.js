/* Shared, DOM-free helpers for course reference previews. */
(function (root) {
  'use strict';

  var supportedKinds = new Set([
    'definition', 'theorem', 'proposition', 'lemma', 'corollary', 'rule',
    'example', 'problem', 'challenge-problem', 'remark', 'warning', 'equation',
  ]);

  function decodeFragment(value) {
    try { return decodeURIComponent(value); } catch (_) { return null; }
  }

  function admitHref(options, base) {
    if (!options || !supportedKinds.has(options.kind) || options.excluded || options.download) return null;
    var href = options.originalHref || options.href;
    var url;
    try { url = new URL(href, base); } catch (_) { return null; }
    var id = decodeFragment(url.hash.slice(1));
    if (!id || !/^https?:$/.test(url.protocol) || url.origin !== new URL(base).origin || !/\.html$/i.test(url.pathname)) return null;
    return {url: url, id: id};
  }

  // Store the in-flight promise so simultaneous references share the request.
  // Failed work is evicted, allowing a subsequent interaction to retry.
  function cachedDocument(cache, key, load) {
    var pending = cache.get(key);
    if (!pending) {
      pending = Promise.resolve().then(load).catch(function (error) {
        cache.delete(key);
        throw error;
      });
      cache.set(key, pending);
    }
    return pending;
  }

  root.CourseReferencePreviewCore = {
    supportedKinds: supportedKinds,
    decodeFragment: decodeFragment,
    admitHref: admitHref,
    cachedDocument: cachedDocument,
  };
}(globalThis));
