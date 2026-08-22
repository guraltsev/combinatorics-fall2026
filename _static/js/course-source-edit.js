(() => {
  "use strict";
  const root = document.body;
  if (!root || root.dataset.courseEditEnabled !== "true") return;
  const status = document.getElementById("course-edit-status");
  const requestPath = root.dataset.courseEditRequestPath;
  const token = root.dataset.courseEditToken;
  const pending = new WeakSet();

  const announce = (message) => { if (status) status.textContent = message; };
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-course-edit-target]");
    if (!button || pending.has(button)) return;
    pending.add(button);
    let target;
    try { target = JSON.parse(button.dataset.courseEditTarget); } catch (_) {
      pending.delete(button); announce("Could not start the editor; see the preview console."); return;
    }
    fetch(requestPath, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Course-Edit-Token": token },
      body: JSON.stringify(target),
    }).then((response) => {
      if (!response.ok) throw new Error("editor request failed");
      announce("Editor started.");
    }).catch(() => {
      announce("Could not start the editor; see the preview console.");
    }).finally(() => pending.delete(button));
  });
})();
