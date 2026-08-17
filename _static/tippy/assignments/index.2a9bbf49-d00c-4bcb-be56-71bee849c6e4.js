selector_to_html = {"a[href=\"#academic-integrity-collaboration-and-artificial-intelligence\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Academic integrity, collaboration, and artificial intelligence<a class=\"headerlink\" href=\"#academic-integrity-collaboration-and-artificial-intelligence\" title=\"Link to this heading\">#</a></h2><p>You are encouraged to work with classmates, tutors, and me: talking through ideas, definitions, and problem-solving strategies is a valuable part of learning. You must understand every solution you submit and write it based on your own understanding. Please do not copy another person\u2019s solution or write-up.</p><p>You may use generative artificial intelligence as a study aid, but not to produce any work that you submit for credit. For example, it is fine to ask a study question such as, \u201cI do not understand when to use generating functions to count combinations with restrictions.\u201d It is not acceptable to ask an AI system how to solve a specific assigned problem. <strong>Rephrasing a generated solution using your own words is NOT ACCEPTABLE</strong>. If you are unsure whether a particular use is allowed, ask me before you submit your work.</p>", "a[href=\"#assignments\"]": "<h1 class=\"tippy-header\" style=\"margin-top: 0;\">Assignments<a class=\"headerlink\" href=\"#assignments\" title=\"Link to this heading\">#</a></h1><h2>Weekly written homework<a class=\"headerlink\" href=\"#weekly-written-homework\" title=\"Link to this heading\">#</a></h2><p>I will post weekly written homework here; you should submit your work through Gradescope. Submission links will be available in <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/outline/\">Blackboard &gt; Assignments &gt; Homework</a></p><p>Weekly homework gives you a chance to work through more involved problems using the techniques we have learned. A complete solution includes both a clear explanation and correct computations.</p>", "a[href=\"#weekly-written-homework\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Weekly written homework<a class=\"headerlink\" href=\"#weekly-written-homework\" title=\"Link to this heading\">#</a></h2><p>I will post weekly written homework here; you should submit your work through Gradescope. Submission links will be available in <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/outline/\">Blackboard &gt; Assignments &gt; Homework</a></p><p>Weekly homework gives you a chance to work through more involved problems using the techniques we have learned. A complete solution includes both a clear explanation and correct computations.</p>", "a[href=\"#online-questions\"]": "<h2 class=\"tippy-header\" style=\"margin-top: 0;\">Online questions<a class=\"headerlink\" href=\"#online-questions\" title=\"Link to this heading\">#</a></h2><p>Online questions usually follow each lecture and are due at the start of our next class meeting.\nThey can be accessed through <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/outline/\">Blackboard - Assignments - Online Questions</a> and the deadlines will appear in your <a class=\"reference external\" href=\"https://learn.uark.edu/ultra/courses/_529368_1/calendar/\">Blackboard Calendar</a>.</p><p>Online questions give you a quick chance to practice vocabulary and core skills before we build on the material. Most questions allow multiple attempts.</p>"}
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
