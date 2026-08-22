selector_to_html = {"a[href=\"calendar.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Calendar<a class=\"headerlink\" href=\"#calendar\" title=\"Link to this heading\">#</a></h1><p>I will put all deadlines on your <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/calendar/\">Blackboard Calendar</a>. Please check it regularly!</p>", "a[href=\"#combinatorics-math31003-01-fall-2026\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Combinatorics MATH31003-01 \u2013 Fall 2026<a class=\"headerlink\" href=\"#combinatorics-math31003-01-fall-2026\" title=\"Link to this heading\">#</a></h1><p><strong>Semester</strong>: Fall 2026\n<strong>Instructor:</strong> Gennady Uraltsev<br/>\n<strong>Meetings:</strong> Mo/We/Fr 8:35 - 9:25, GEAR 108</p><p>Welcome to Combinatorics! We will explore the mathematics of discrete objects: the many ways things can be selected, arranged, connected, and counted.\nThe course covers basic combinatorial techniques, the principle of inclusion-exclusion, generating functions, and recursive relations.\nAs additional topics we may cover modular arithmetic and applications to encryption, coding theory, graph theory, counting with symmetries, and algebraic structures.</p>", "a[href=\"resources.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Resources<a class=\"headerlink\" href=\"#resources\" title=\"Link to this heading\">#</a></h1><p>I will provide lecture notes or detailed references for all the topics we cover and you should know.</p><p>I may also include <em>additional material</em> like links to youtube videos and more. This additional material is <em>optional</em> and provided as an alternative explanation of the topics I cover.</p>", "a[href=\"syllabus.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Syllabus<a class=\"headerlink\" href=\"#syllabus\" title=\"Link to this heading\">#</a></h1><h2>Course overview<a class=\"headerlink\" href=\"#course-overview\" title=\"Link to this heading\">#</a></h2><p>Combinatorics begins with a simple questions: How many ways can we arrange a collection of objects? Can a schedule, pairing, or design be made at all? What changes when two arrangements should count as the same? These questions show up in mathematics, computer science, probability, and more\u2026</p><p>We will learn foundational combinatorial techniques, the inclusion-exclusion principle, allowing us to count efficiently.</p>", "a[href=\"#start-here\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Start here<a class=\"headerlink\" href=\"#start-here\" title=\"Link to this heading\">#</a></h2><p>Please check the <a class=\"reference internal\" href=\"calendar.html\"><span class=\"std std-doc\">course calendar</span></a> for holidays, University deadlines, and topic updates.</p>", "a[href=\"lecture-notes/index.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Lecture Notes<a class=\"headerlink\" href=\"#lecture-notes\" title=\"Link to this heading\">#</a></h1><h2>Unit map<a class=\"headerlink\" href=\"#unit-map\" title=\"Link to this heading\">#</a></h2>", "a[href=\"assignments/index.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Assignments<a class=\"headerlink\" href=\"#assignments\" title=\"Link to this heading\">#</a></h1><h2>Published homework<a class=\"headerlink\" href=\"#published-homework\" title=\"Link to this heading\">#</a></h2>"}
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
