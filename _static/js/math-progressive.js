/* Keep server-rendered SVG math unless the full MathJax browser bundle loads. */
(function () {
  'use strict';

  var fallbackMath = Array.from(document.querySelectorAll('[data-math-prerendered]'));
  if (!fallbackMath.length) return;

  window.MathJax = {
    loader: {load: ['[tex]/cancel', '[tex]/textmacros']},
    tex: {packages: {'[+]': ['cancel', 'textmacros']}},
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

        var pending = fallbacks.map(function (fallback) {
          fallback.dataset.mathEnhancing = 'true';
          var display = fallback.dataset.mathDisplay === 'block';
          var svg = fallback.querySelector(':scope > .math-svg');
          if (!svg) throw new Error('Prerendered math has no SVG fallback');
          // Keep the fallback visible while MathJax works.  Typeset beside it
          // in the formula's final DOM location, then make a single swap only
          // after MathJax has produced its complete SVG container.
          var staging = document.createElement('span');
          staging.setAttribute('aria-hidden', 'true');
          staging.style.visibility = 'hidden';
          staging.style.position = 'absolute';
          staging.style.pointerEvents = 'none';
          staging.append(document.createTextNode(display
            ? '\\[' + fallback.dataset.tex + '\\]'
            : '\\(' + fallback.dataset.tex + '\\)'));
          var fontSize = getComputedStyle(svg).fontSize;
          svg.after(staging);
          return {svg: svg, staging: staging, fontSize: fontSize};
        });

        try {
          // The staging nodes are in the final document, avoiding the
          // detached-tree context-menu issue while preserving the SVG until
          // every replacement has rendered.
          await window.MathJax.typesetPromise(pending.map(function (item) {
            return item.staging;
          }));
          var enhanced = pending.map(function (item) {
            return item.staging.querySelector(':scope > mjx-container');
          });
          if (enhanced.some(function (node) { return !node; })) {
            throw new Error('MathJax did not produce output for every expression');
          }

          fallbacks.forEach(function (fallback, index) {
            // Browser MathJax applies an ex-height font-size correction to its
            // container.  The build-time SVG inherits the surrounding size,
            // so retain that measured size to keep identical SVG geometry.
            enhanced[index].style.fontSize = pending[index].fontSize;
            // Replacing the SVG directly avoids any visible intermediate
            // state: the completed MathJax container takes its exact place.
            pending[index].svg.replaceWith(enhanced[index]);
            pending[index].staging.remove();
            fallback.classList.remove('math-fallback');
            fallback.classList.add('math-enhanced');
            fallback.removeAttribute('role');
            fallback.removeAttribute('aria-label');
            fallback.removeAttribute('tabindex');
          });
        } catch (error) {
          // The fallback SVG was never removed, so failure simply discards the
          // hidden staging output and leaves the no-JavaScript baseline intact.
          if (window.MathJax.typesetClear) window.MathJax.typesetClear(pending.map(function (item) {
            return item.staging;
          }));
          pending.forEach(function (item) {
            item.staging.remove();
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
