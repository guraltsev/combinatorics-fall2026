selector_to_html = {"a[href=\"#daily-lecture-log\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Daily lecture log<a class=\"headerlink\" href=\"#daily-lecture-log\" title=\"Link to this heading\">#</a></h2><p><span class=\"lecture-log-tentative\">Tentative</span>: Lecture topics may change.</p>", "a[href=\"#exams\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Exams<a class=\"headerlink\" href=\"#exams\" title=\"Link to this heading\">#</a></h2><p>Our midterms are in Weeks 5, 9, and 13. The fourth unit exam takes place during the first part of the final-exam period.</p>", "a[href=\"#calendar\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Calendar<a class=\"headerlink\" href=\"#calendar\" title=\"Link to this heading\">#</a></h1><p>I will put all deadlines on your <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/calendar/\">Blackboard Calendar</a>. Please check it regularly!</p>", "a[href=\"#week-and-unit-overview\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Week and unit overview<a class=\"headerlink\" href=\"#week-and-unit-overview\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#key-university-dates\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Key university dates<a class=\"headerlink\" href=\"#key-university-dates\" title=\"Link to this heading\">#</a></h2><p>For official University dates, see the <a class=\"reference external\" href=\"https://registrar.uark.edu/academic-dates/academic-semester-calendar/\">Fall 2026 academic calendar</a> and the <a class=\"reference external\" href=\"https://registrar.uark.edu/registration/final-exam-schedule/fall-2026-final-exam-schedule.php\">Registrar\u2019s final-exam schedule</a>.</p>"}
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
