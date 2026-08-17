/* Keep server-rendered SVG math unless the full MathJax browser bundle loads. */
(function () {
  'use strict';

  var fallbackMath = Array.from(document.querySelectorAll('[data-math-prerendered]'));
  if (!fallbackMath.length) return;

  window.MathJax = {
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
          return fallback.classList.contains('math-fallback') && !fallback.dataset.mathEnhancing;
        });
        if (!fallbacks.length) return;

        var staging = document.createElement('div');
        staging.className = 'math-enhancement-staging mathjax_process';
        var article = document.querySelector('.bd-article');
        if (article) staging.style.width = article.getBoundingClientRect().width + 'px';

        var placeholders = fallbacks.map(function (fallback) {
          fallback.dataset.mathEnhancing = 'true';
          var placeholder = document.createElement('span');
          var display = fallback.dataset.mathDisplay === 'block';
          placeholder.textContent = display
            ? '\\[' + fallback.dataset.tex + '\\]'
            : '\\(' + fallback.dataset.tex + '\\)';
          staging.appendChild(placeholder);
          return placeholder;
        });

        document.body.appendChild(staging);
        try {
          // Normal page typesetting installs MathJax's SVG styles and applies
          // the complete accessibility render actions.  Staging all
          // expressions also keeps the visible SVGs stable until one swap.
          await window.MathJax.typesetPromise([staging]);
          var enhanced = placeholders.map(function (placeholder) {
            return placeholder.querySelector(':scope > mjx-container');
          });
          if (enhanced.some(function (node) { return !node; })) {
            throw new Error('MathJax did not produce output for every expression');
          }

          fallbacks.forEach(function (fallback, index) {
            var svg = fallback.querySelector(':scope > .math-svg');
            if (!svg) return;
            // Browser MathJax applies an ex-height font-size correction to its
            // container.  The build-time SVG inherits the surrounding size,
            // so retain that measured size to keep identical SVG geometry.
            enhanced[index].style.fontSize = getComputedStyle(svg).fontSize;
            svg.replaceWith(enhanced[index]);
            fallback.classList.remove('math-fallback');
            fallback.classList.add('math-enhanced');
            fallback.removeAttribute('role');
            fallback.removeAttribute('aria-label');
            fallback.removeAttribute('tabindex');
          });
        } finally {
          staging.remove();
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
