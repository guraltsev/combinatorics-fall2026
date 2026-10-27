(function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region ../../devel/site_builder/plugins/teaching/client/copy-button.ts
/**
	* Generic copy-to-clipboard button helper (used by `sb-myopenmath`).
	* Behaviour: on click the text is copied; the label shows "Copied" or "Copy failed" for 1.8 s
	* and then returns to its original text.
	*/
	const COPY_LABELS = {
		copied: "Copied",
		failed: "Copy failed"
	};
	const COPY_RESET_MS = 1800;
	/** Copy text; resolves true on success, false if the clipboard is unavailable or rejects. */
	async function copyText(text, clipboard) {
		if (!clipboard || typeof clipboard.writeText !== "function") return false;
		try {
			await clipboard.writeText(text);
			return true;
		} catch {
			return false;
		}
	}
	/** Bind one button. Returns a function that removes the listener. */
	function bindCopyButton(button, opts) {
		const win = button.ownerDocument.defaultView;
		const clipboard = opts.clipboard ?? win?.navigator?.clipboard;
		const st = opts.setTimeout ?? ((f, ms) => win.setTimeout(f, ms));
		const ct = opts.clearTimeout ?? ((h) => win.clearTimeout(h));
		const original = button.textContent ?? "";
		let timer = null;
		const onClick = async () => {
			const ok = await copyText(opts.getText(), clipboard);
			button.textContent = ok ? COPY_LABELS.copied : COPY_LABELS.failed;
			button.setAttribute("data-sb-copy-state", ok ? "copied" : "failed");
			if (timer !== null) ct(timer);
			timer = st(() => {
				button.textContent = original;
				button.removeAttribute("data-sb-copy-state");
				timer = null;
			}, COPY_RESET_MS);
		};
		button.addEventListener("click", onClick);
		return () => button.removeEventListener("click", onClick);
	}
	/** Bind every button matching `selector` under `root`; `textOf` maps a button to the text to copy. */
	function initCopyButtons(root, selector, textOf, opts = {}) {
		for (const b of root.querySelectorAll(selector)) bindCopyButton(b, {
			...opts,
			getText: () => textOf(b)
		});
	}

//#endregion
//#region ../../devel/site_builder/plugins/teaching/assets/myopenmath-copy.ts
/**
	* Client entry of `sb-myopenmath`: wires the copy buttons
	* (`[data-sb-ui="chrome:sb-myopenmath/copy"] > button`) to the shell's copy
	* helper. A button copies the `code.textContent` of its `sb-mom-*` element;
	* the label becomes "Copied" / "Copy failed" for 1.8 s (done by the helper).
	* The helper is the plugin's own (`client/copy-button.ts`).
	*/
	function initMomCopyButtons(root = document) {
		initCopyButtons(root, "[data-sb-ui=\"chrome:sb-myopenmath/copy\"] > button", (button) => {
			return button.closest("sb-mom-metadata, sb-mom-common-control, sb-mom-question, sb-mom-solution")?.querySelector("code")?.textContent ?? "";
		});
	}
	if (typeof document !== "undefined") initMomCopyButtons(document);

//#endregion
exports.initMomCopyButtons = initMomCopyButtons;
return exports;
})({});