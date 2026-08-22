selector_to_html = {"a[href=\"#resources\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Resources<a class=\"headerlink\" href=\"#resources\" title=\"Link to this heading\">#</a></h1><p>For every topic we cover, I will provide either lecture notes or a precise reading reference. The books below offer complementary treatments; you do not need to purchase them.</p>", "a[href=\"#office-hours\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Office hours<a class=\"headerlink\" href=\"#office-hours\" title=\"Link to this heading\">#</a></h2><p>Office hours are part of the course.\nBring questions about definitions, proofs, examples, reading, or homework - even when your question is only \u201cwhere should I start?\u201d</p><p>Discussing homework in office hours is encouraged. If you give a clear, complete solution of a designated homework exercise, I may propose to you a grade for that exercise during the meeting. If you are satisfied with the grade, you will not need to submit a written solution for that exercise.</p>", "a[href=\"#main-textbook\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Main textbook<a class=\"headerlink\" href=\"#main-textbook\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#additional-references\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Additional references<a class=\"headerlink\" href=\"#additional-references\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#access-and-well-being\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Access and well-being<a class=\"headerlink\" href=\"#access-and-well-being\" title=\"Link to this heading\">#</a></h2>"}
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
