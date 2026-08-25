selector_to_html = {"a[href=\"#main-textbook\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Main textbook<a class=\"headerlink\" href=\"#main-textbook\" title=\"Link to this heading\">#</a></h2><p>M. T. Keller and W. T. Trotter, <em>Applied Combinatorics</em>:\n<a class=\"reference external\" href=\"https://appliedcombinatorics.org/book/app-comb-2.html\">web edition</a> and\n<a class=\"reference external\" href=\"https://appliedcombinatorics.org/book-pdf/app-comb-2017.pdf\">PDF edition</a>.</p>", "a[href=\"#additional-references\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Additional references<a class=\"headerlink\" href=\"#additional-references\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#resources\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Resources<a class=\"headerlink\" href=\"#resources\" title=\"Link to this heading\">#</a></h1><p>I will provide lecture notes or detailed references for all topics we cover. I\nmay also include optional videos and other additional material as alternative\nexplanations or extra practice.</p>", "a[href=\"#mathematics-help\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Mathematics help<a class=\"headerlink\" href=\"#mathematics-help\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#access-and-well-being\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Access and well-being<a class=\"headerlink\" href=\"#access-and-well-being\" title=\"Link to this heading\">#</a></h2>"}
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
