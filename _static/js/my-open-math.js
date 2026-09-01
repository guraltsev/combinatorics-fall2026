/** Provides disclosure and copy behavior for semantic MyOpenMath exports. */
(() => {
  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Clipboard copy failed");
  }

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".my-open-math__copy");
    if (!button) return;
    const section = button.closest(".my-open-math__section");
    const source = section?.querySelector("code")?.textContent;
    if (source == null) return;
    const label = button.getAttribute("aria-label") || "Copy source";
    try {
      await copyText(source);
      button.textContent = "Copied";
      button.setAttribute("aria-label", label.replace(/^Copy /, "Copied "));
    } catch {
      button.textContent = "Copy failed";
      button.setAttribute("aria-label", "Could not copy source");
    }
    window.setTimeout(() => {
      button.textContent = "Copy";
      button.setAttribute("aria-label", label);
    }, 1800);
  });
})();
