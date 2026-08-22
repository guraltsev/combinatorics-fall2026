selector_to_html = {"a[href=\"#start-here\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Start here<a class=\"headerlink\" href=\"#start-here\" title=\"Link to this heading\">#</a></h2><p>Please check the <a class=\"reference internal\" href=\"calendar.html\"><span class=\"doc\">course calendar</span></a> for holidays, University deadlines, and topic updates.\n</p>", "a[href=\"syllabus.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Syllabus<a class=\"headerlink\" href=\"#syllabus\" title=\"Link to this heading\">#</a></h1><p><em>Note: On weeks with departmental meetings, office hours begin at 4:30 p.m.</em></p>", "a[href=\"assignments/index.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Assignments<a class=\"headerlink\" href=\"#assignments\" title=\"Link to this heading\">#</a></h1><h2>Weekly written homework<a class=\"headerlink\" href=\"#weekly-written-homework\" title=\"Link to this heading\">#</a></h2><p>I will post written homework here approximately weekly. Submit through Gradescope using the links in <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529398_1/outline/\">Blackboard &gt; Assignments &gt; Homework</a>.</p><p>You are encouraged to work in groups of up to three. Make one submission per group and list every group member clearly.</p>", "a[href=\"lecture-notes/index.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Lecture Notes<a class=\"headerlink\" href=\"#lecture-notes\" title=\"Link to this heading\">#</a></h1><p>Lecture notes will be added here as the semester progresses. Until a note is published, use the reading listed in the <a class=\"reference internal\" href=\"calendar.html\"><span class=\"doc\">daily lecture log</span></a>.</p>", "a[href=\"resources.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Resources<a class=\"headerlink\" href=\"#resources\" title=\"Link to this heading\">#</a></h1><p>For every topic we cover, I will provide either lecture notes or a precise reading reference. The books below offer complementary treatments; you do not need to purchase them.</p>", "a[href=\"calendar.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Calendar<a class=\"headerlink\" href=\"#calendar\" title=\"Link to this heading\">#</a></h1><p>I will put all deadlines on your <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529398_1/calendar/\">Blackboard Calendar</a>. Please check it regularly!</p>", "a[href=\"#real-variables-i-math55003-01-fall-2026\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">REAL VARIABLES I MATH55003-01 \u2013 Fall 2026<a class=\"headerlink\" href=\"#real-variables-i-math55003-01-fall-2026\" title=\"Link to this heading\">#</a></h1><p><strong>Semester:</strong> <span>Fall 2026</span></p><p><strong>Instructor:</strong> <span>Gennady Uraltsev</span></p>"}
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
