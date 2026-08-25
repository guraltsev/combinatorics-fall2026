/* Keep server-rendered SVG math unless the full MathJax browser bundle loads. */
(function () {
  'use strict';

  var fallbackMath = Array.from(document.querySelectorAll('[data-math-prerendered]'));
  if (!fallbackMath.length) return;

  window.MathJax = {
    loader: {load: ['[tex]/cancel']},
    tex: {packages: {'[+]': ['cancel']}},
    options: {
      menuOptions: {
        settings: {
          enrich: true,
          speech: true,
          braille: true,
          assistiveMml: false
        }
      },
      sre: {locale: 'en', domain: 'mathspeak', style: 'default'}
    }
  };

  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-mml-svg.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.referrerPolicy = 'no-referrer';

  script.addEventListener('load', async function () {
    try {
      await window.MathJax.startup.promise;
      async function enhanceAll(candidates) {
        var fallbacks = candidates.filter(function (fallback) {
          if (fallback.classList.contains('math-custom-preamble')) {
            delete fallback.dataset.mathEnhancing;
            return false;
          }
          return fallback.classList.contains('math-fallback') && !fallback.dataset.mathEnhancing;
        });
        if (!fallbacks.length) return;

        var originals = fallbacks.map(function (fallback) {
          fallback.dataset.mathEnhancing = 'true';
          var display = fallback.dataset.mathDisplay === 'block';
          var svg = fallback.querySelector(':scope > .math-svg');
          if (!svg) throw new Error('Prerendered math has no SVG fallback');
          var source = document.createTextNode(display
            ? '\\[' + fallback.dataset.tex + '\\]'
            : '\\(' + fallback.dataset.tex + '\\)');
          var children = Array.from(fallback.childNodes);
          var fontSize = getComputedStyle(svg).fontSize;
          fallback.style.visibility = 'hidden';
          svg.replaceWith(source);
          return {children: children, fontSize: fontSize};
        });

        try {
          // Typeset in each formula's final DOM location.  Moving a finished
          // MathJax container out of an off-screen staging tree leaves its
          // context-menu bookkeeping tied to detached nodes in some MathJax
          // versions.  In-place typesetting keeps its click, keyboard, and
          // right-click handlers attached to the visible container.
          await window.MathJax.typesetPromise(fallbacks);
          var enhanced = fallbacks.map(function (fallback) {
            return fallback.querySelector(':scope > mjx-container');
          });
          if (enhanced.some(function (node) { return !node; })) {
            throw new Error('MathJax did not produce output for every expression');
          }

          fallbacks.forEach(function (fallback, index) {
            // Browser MathJax applies an ex-height font-size correction to its
            // container.  The build-time SVG inherits the surrounding size,
            // so retain that measured size to keep identical SVG geometry.
            enhanced[index].style.fontSize = originals[index].fontSize;
            fallback.classList.remove('math-fallback');
            fallback.classList.add('math-enhanced');
            fallback.removeAttribute('role');
            fallback.removeAttribute('aria-label');
            fallback.removeAttribute('tabindex');
            fallback.style.removeProperty('visibility');
          });
        } catch (error) {
          // Keep the no-JavaScript SVG baseline intact if enhancement fails
          // part way through a batch.
          if (window.MathJax.typesetClear) window.MathJax.typesetClear(fallbacks);
          fallbacks.forEach(function (fallback, index) {
            fallback.replaceChildren.apply(fallback, originals[index].children);
            fallback.style.removeProperty('visibility');
          });
          throw error;
        } finally {
          fallbacks.forEach(function (fallback) {
            delete fallback.dataset.mathEnhancing;
          });
        }
      }

      await enhanceAll(fallbackMath);

      new MutationObserver(function (mutations) {
        var addedMath = [];
        for (var mutation of mutations) {
          for (var node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches('[data-math-prerendered]')) addedMath.push(node);
            addedMath.push.apply(addedMath, node.querySelectorAll('[data-math-prerendered]'));
          }
        }
        enhanceAll(addedMath).catch(function (error) {
          console.warn('MathJax could not enhance dynamically added math.', error);
        });
      }).observe(document.body, {childList: true, subtree: true});
    } catch (error) {
      console.warn('MathJax enhancement was unavailable; retaining prerendered SVG math.', error);
    }
  });
  script.addEventListener('error', function () {
    console.info('MathJax could not be loaded; retaining prerendered SVG math.');
  });
  document.head.appendChild(script);
}());
