/* Lazy, progressively enhanced semantic-reference previews. */
(function () {
  'use strict';

  var core = window.CourseReferencePreviewCore;
  if (!core) return;
  var kinds = core.supportedKinds;
  var host, activeLink = null, generation = 0, showTimer = null, hideTimer = null, openCleanup = null;
  var documentCache = new Map();
  var previewNumber = 0;
  var finePointer = !window.matchMedia || window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;

  function clearTimer(name) { if (name === 'show' && showTimer) { clearTimeout(showTimer); showTimer = null; } if (name === 'hide' && hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }
  function card() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'course-reference-preview-card'; host.className = 'course-reference-preview-card';
    host.setAttribute('role', 'tooltip'); host.setAttribute('popover', 'manual'); host.setAttribute('hidden', ''); host.dataset.courseReferencePreviewHost = '';
    host.addEventListener('pointerenter', function () { clearTimer('hide'); });
    host.addEventListener('pointerleave', scheduleClose);
    document.body.append(host); return host;
  }
  function candidate(link) { return link && link.matches('article.bd-article a.course-reference-preview[href]') && kinds.has(link.dataset.coursePreviewKind) && !link.classList.contains('no-hover-preview') && !link.hasAttribute('download'); }
  function exactId(root, id) { return Array.from(root.querySelectorAll('[id]')).find(function (node) { return node.id === id; }) || null; }
  function packagedTarget(link) {
    var docname = link.dataset.courseFocusTargetId;
    var raw = link.dataset.courseOriginalHref || link.getAttribute('href');
    var hash = raw.indexOf('#'); var id = hash >= 0 ? core.decodeFragment(raw.slice(hash + 1)) : null;
    if (!docname || !id) return null;
    var live = document.querySelector('article.bd-article');
    var template = Array.from(document.querySelectorAll('template[data-single-page-content]')).find(function (item) { return item.dataset.singlePageContent === docname; });
    var root = document.body.dataset.courseDocname === docname ? live : template?.content;
    return root ? {root: root, target: exactId(root, id), base: location.href} : null;
  }
  function admitted(link) {
    if (!candidate(link)) return null;
    return core.admitHref({
      href: link.getAttribute('href'), originalHref: link.dataset.courseOriginalHref,
      kind: link.dataset.coursePreviewKind, excluded: link.classList.contains('no-hover-preview'),
      download: link.hasAttribute('download'),
    }, location.href);
  }
  function acquire(link) {
    if (document.querySelector('template[data-single-page-content]')) return Promise.resolve(packagedTarget(link));
    var allowed = admitted(link); if (!allowed) return Promise.resolve(null);
    if (allowed.url.pathname === location.pathname && allowed.url.search === location.search) return Promise.resolve({root: document, target: document.getElementById(allowed.id), base: location.href});
    var page = new URL(allowed.url); page.hash = ''; var key = page.href;
    return core.cachedDocument(documentCache, key, function () { return fetch(key, {credentials: 'same-origin'}).then(function (response) {
      if (!response.ok) throw new Error('preview request failed: ' + response.status);
      return response.text().then(function (text) { return {document: new DOMParser().parseFromString(text, 'text/html'), base: response.url || key}; });
    }); }).then(function (item) { return {root: item.document, target: item.document.getElementById(allowed.id), base: item.base}; });
  }
  function kindFor(node) { if (!node) return null; if (node.matches('.math.notranslate.nohighlight')) return 'equation'; var map = {'admonition-definition':'definition','admonition-theorem':'theorem','admonition-proposition':'proposition','admonition-lemma':'lemma','admonition-rule':'rule','admonition-example':'example','admonition-problem':'problem','admonition-challenge-problem':'challenge-problem','warning':'warning','remark':'remark'}; return Object.keys(map).find(function (name) { return node.classList.contains(name); }) ? map[Object.keys(map).find(function (name) { return node.classList.contains(name); })] : null; }
  function extract(item, kind) {
    if (!item || !item.target) return null;
    var node = kind === 'equation' ? (item.target.matches('.math.notranslate.nohighlight') ? item.target : item.target.closest('.math.notranslate.nohighlight')) : (item.target.matches('.admonition') ? item.target : item.target.closest('.admonition'));
    if (!node || kindFor(node) !== kind) return null;
    if (item.root.nodeType === Document.DOCUMENT_NODE && !node.closest('article.bd-article')) return null;
    var clone = node.cloneNode(true);
    if (kind === 'equation') clone.querySelectorAll('.eqno,.headerlink').forEach(function (el) { el.remove(); });
    return normalize(clone, item.base);
  }
  function normalize(clone, base) {
    clone.querySelectorAll('script,style,link,meta,base,iframe,object,embed,form,input,select,textarea,button,audio,video,.edit-only,[data-edit-control]').forEach(function (el) { el.remove(); });
    clone.querySelectorAll('*').forEach(function (el) {
      Array.from(el.attributes).forEach(function (attr) {
        if (/^on/i.test(attr.name) || /^(?:data-course-edit-|data-edit-)/.test(attr.name) || ['tabindex','autofocus','contenteditable','controls'].includes(attr.name)) el.removeAttribute(attr.name);
      });
      ['src','poster'].forEach(function (name) { if (el.hasAttribute(name)) { try { el.setAttribute(name, new URL(el.getAttribute(name), base).href); } catch (_) {} } });
      if (el.hasAttribute('srcset')) el.setAttribute('srcset', el.getAttribute('srcset').split(',').map(function (part) { var bits = part.trim().split(/\s+/, 2); try { bits[0] = new URL(bits[0], base).href; } catch (_) {} return bits.join(' '); }).join(', '));
    });
    clone.querySelectorAll('details').forEach(function (details) { var replacement = document.createElement('div'); Array.from(details.attributes).forEach(function (attr) { if (attr.name !== 'open') replacement.setAttribute(attr.name, attr.value); }); while (details.firstChild) replacement.append(details.firstChild); details.replaceWith(replacement); });
    clone.querySelectorAll('summary').forEach(function (summary) { var replacement = document.createElement('span'); while (summary.firstChild) replacement.append(summary.firstChild); summary.replaceWith(replacement); });
    clone.querySelectorAll('a').forEach(function (anchor) { var span = document.createElement('span'); while (anchor.firstChild) span.append(anchor.firstChild); anchor.replaceWith(span); });
    var referenced = new Set(); clone.querySelectorAll('[href],[xlink\\:href],[for],[aria-labelledby],[aria-describedby]').forEach(function (el) { ['href','xlink:href','for','aria-labelledby','aria-describedby'].forEach(function (name) { var value = el.getAttribute(name); if (!value) return; value.split(/\s+/).forEach(function (entry) { if (entry[0] === '#') referenced.add(entry.slice(1)); else if (name !== 'href') referenced.add(entry); }); }); });
    var prefix = 'course-preview-' + (++previewNumber) + '-'; var ids = new Map();
    clone.querySelectorAll('[id]').forEach(function (el) { if (!referenced.has(el.id)) { el.removeAttribute('id'); return; } ids.set(el.id, prefix + el.id); el.id = prefix + el.id; });
    clone.querySelectorAll('[href],[xlink\\:href],[for],[aria-labelledby],[aria-describedby]').forEach(function (el) { ['href','xlink:href','for','aria-labelledby','aria-describedby'].forEach(function (name) { var value = el.getAttribute(name); if (!value) return; var rewritten = value.split(/\s+/).map(function (entry) { var key = entry[0] === '#' ? entry.slice(1) : entry; var replacement = ids.get(key); return replacement ? (entry[0] === '#' ? '#' : '') + replacement : entry; }).join(' '); el.setAttribute(name, rewritten); }); });
    return clone;
  }
  function close() { clearTimer('show'); clearTimer('hide'); generation++; if (openCleanup) { openCleanup(); openCleanup = null; } if (activeLink) activeLink.removeAttribute('aria-describedby'); activeLink = null; if (!host) return; if (host.hidePopover && host.matches(':popover-open')) host.hidePopover(); host.hidden = true; host.classList.remove('course-reference-preview-card--open'); host.replaceChildren(); }
  function scheduleClose() { clearTimer('hide'); hideTimer = setTimeout(close, 100); }
  function position(link) {
    var floating = window.FloatingUIDOM;
    if (!floating) return;
    function update() {
      var spaceBelow = window.innerHeight - link.getBoundingClientRect().bottom - 8;
      var size = floating.size({padding: 8, apply: function (state) {
        Object.assign(host.style, {
          maxWidth: Math.min(500, state.availableWidth) + 'px',
          maxHeight: Math.min(Math.min(448, window.innerHeight * .7), state.availableHeight) + 'px',
        });
      }});
      var middleware = [floating.offset(8)];
      if (spaceBelow > 0) {
        // Size before collision handling and retain the bottom placement while
        // there is room below the link.  This avoids covering its line or the
        // text above it.
        middleware.push(size, floating.flip({fallbackPlacements: []}));
      } else {
        // At the bottom edge there is nowhere to show a useful card below the
        // link.  Let Floating UI use its normal top fallback until scrolling
        // creates room; autoUpdate will then return it to the bottom.
        middleware.push(floating.flip(), size);
      }
      middleware.push(
        // Preserve the vertical anchor below the link; horizontal movement is
        // still allowed to keep the card inside the viewport.
        floating.shift({padding: 8, mainAxis: false}),
      );
      floating.computePosition(link, host, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: middleware,
      }).then(function (value) {
        Object.assign(host.style, {left: value.x + 'px', top: value.y + 'px'});
      });
    }
    update();
    openCleanup = floating.autoUpdate(link, host, update);
  }
  function start(link, delay) { if (!candidate(link)) return; close(); activeLink = link; var token = ++generation; function open() { showTimer = null; acquire(link).then(function (item) { var content = extract(item, link.dataset.coursePreviewKind); if (!content || token !== generation || activeLink !== link) return; card().replaceChildren(content); host.hidden = false; host.classList.add('course-reference-preview-card--open'); if (host.showPopover) host.showPopover(); link.setAttribute('aria-describedby', host.id); position(link); }).catch(function (error) { if (token === generation) { activeLink = null; console.warn('Course reference preview unavailable.', error); } }); } if (delay) showTimer = setTimeout(open, delay); else open(); }
  function relatedInside(link, related) { return related && (link.contains(related) || (host && host.contains(related))); }
  function install() {
    document.addEventListener('pointerover', function (event) { var link = event.target.closest('a'); if (finePointer && candidate(link) && !relatedInside(link, event.relatedTarget)) start(link, 250); });
    document.addEventListener('pointerout', function (event) { var link = event.target.closest('a'); if (link === activeLink && !relatedInside(link, event.relatedTarget)) scheduleClose(); });
    document.addEventListener('focusin', function (event) { var link = event.target.closest('a'); if (candidate(link)) start(link, 0); });
    document.addEventListener('focusout', function (event) { if (event.target === activeLink) scheduleClose(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    window.addEventListener('pagehide', close); window.addEventListener('course:virtualpagechange', close);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true}); else install();
}());
