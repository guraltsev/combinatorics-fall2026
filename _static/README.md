# Public theme assets

## Purpose

This directory holds CSS, JavaScript, and images emitted with every ordinary HTML build.

## Contract

`css/` styles the semantic course shell, `js/` progressively enhances rendered HTML, and `assets/` provides local icons. The assets are referenced through Sphinx static paths and must remain locally available in built output.

## Limits and safety

Preserve a usable no-JavaScript baseline and avoid remote runtime URLs. Assets under `edit-static/` are intentionally separate and must not be moved here.

## Change and verification

Run `npm run test:math` for math behavior and `tests/scripts/test_check_layout.py`/`check_offline_assets.py` when asset paths or loading changes.
