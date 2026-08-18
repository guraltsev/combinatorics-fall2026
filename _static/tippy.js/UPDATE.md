# Updating tippy.js

From `website`, install an exact npm version with `npm install --save-exact tippy.js@VERSION`, then run `..\.venv\Scripts\python.exe scripts\vendor_assets.py`.

Review the upstream license and release notes. Commit the lockfile, package manifest, license, generated manifest, and copied files together. Never hand-edit `tippy.umd.min.js` or `tippy.css` or use a version range.
