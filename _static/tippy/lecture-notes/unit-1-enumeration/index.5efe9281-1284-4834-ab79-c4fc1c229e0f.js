selector_to_html = {"a[href=\"#unit-i-enumeration-and-inclusion-exclusion\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Unit I: Enumeration and inclusion-exclusion<a class=\"headerlink\" href=\"#unit-i-enumeration-and-inclusion-exclusion\" title=\"Link to this heading\">#</a></h1><p>Unit I develops precise counting models and the basic rules for combining,\nsubtracting, and correcting counts.</p>"}
skip_classes = ["headerlink", "sd-stretched-link", "no-hover-preview"]

window.onload = function () {
    for (const [select, tip_html] of Object.entries(selector_to_html)) {
        const links = document.querySelectorAll(`article.bd-article ${select}`);
        for (const link of links) {
            if (skip_classes.some(c => link.classList.contains(c))) {
                continue;
            }

            tippy(link, {
                content: tip_html,
                allowHTML: true,
                arrow: true,
                placement: 'auto-start', maxWidth: 500, interactive: false,
                onShow(instance) {MathJax.typesetPromise([instance.popper]).then(() => {});},
            });
        };
    };
    console.log("tippy tips loaded!");
};
