selector_to_html = {"a[href=\"#calendar:week-summary\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Week and unit overview<a class=\"headerlink\" href=\"#calendar:week-summary\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#exams\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Exams<a class=\"headerlink\" href=\"#exams\" title=\"Link to this heading\">#</a></h2>", "a[href=\"#key-university-dates\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Key university dates<a class=\"headerlink\" href=\"#key-university-dates\" title=\"Link to this heading\">#</a></h2><p>For official University dates, see the\n<a class=\"reference external\" href=\"https://registrar.uark.edu/academic-dates/academic-semester-calendar/\">Fall\n2026 academic calendar</a> and the <a class=\"reference external\" href=\"https://registrar.uark.edu/registration/final-exam-schedule/fall-2026-final-exam-schedule.php\">Registrar\u2019s final-exam schedule</a>.</p>", "a[href=\"lecture-notes/unit-1-enumeration/01-set-notation-and-basic-counting.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">1. Set notation and basic counting<a class=\"headerlink\" href=\"#set-notation-and-basic-counting\" title=\"Link to this heading\">#</a></h1><p>Combinatorics is all about counting objects. We introduce the notation for \u201ccontainers\u201d of objects a.k.a. <strong>sets</strong> and define operations on sets. Next, we study the first two counting methods: the sum rule and product rule.</p>", "a[href=\"#calendar:daily-log\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Daily lecture log<a class=\"headerlink\" href=\"#calendar:daily-log\" title=\"Link to this heading\">#</a></h2><p>The public daily log below contains the lectures currently released. Later\nplanning entries remain in the instructor\u2019s private lecture log and do not\nappear in this navigation.</p>", "a[href=\"lecture-notes/unit-1-enumeration/03-applications-of-combinations-and-repetition.html\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">3. Applications of combinations and combinations with repetition<a class=\"headerlink\" href=\"#applications-of-combinations-and-combinations-with-repetition\" title=\"Link to this heading\">#</a></h1><p>The previous notes introduced strings, permutations, and combinations. The\ncentral modeling questions were whether order matters and whether an object may\nbe chosen more than once. In this lecture we use those questions to count\nlattice paths and repeated-letter anagrams. We then develop the remaining basic\nmodel: unordered selections in which repetition is allowed.</p><p>By the end of the lecture, you should be able to do the following.</p>", "a[href=\"#calendar\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Calendar<a class=\"headerlink\" href=\"#calendar\" title=\"Link to this heading\">#</a></h1><p>I will put all deadlines on the <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/calendar/\">Blackboard\nCalendar</a>. Please check it regularly.</p>"}
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
