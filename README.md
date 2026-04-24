# poppet-t.github.io

Personal site of Duanmu Chuanjie (poppet-t). Nintendo DS Lite-inspired pixel-art portfolio.

Live: https://poppet-t.github.io

## Stack

Vanilla HTML, CSS, and JavaScript. No build step. Served as-is by GitHub Pages.

- `index.html` — single page, 5 hash-routed sections
- `styles.css` — all styles
- `main.js` — section switching, hash routing, keyboard nav, ORD countdown, clock
- `fishing.gif` — 3-frame animated pixel avatar (built from `fishing.png` via `scripts/build_avatar.py`)
- `resume.pdf` — résumé download
- Fonts: Press Start 2P, VT323, JetBrains Mono (Google Fonts)

## Local development

```sh
python3 -m http.server 8000
open http://localhost:8000
```

## Rebuilding the avatar

Only needed when `fishing.png` changes:

```sh
python3 -m pip install --user pillow rembg onnxruntime
python3 scripts/build_avatar.py
```

## Deployment

Pushed to `main`. GitHub Pages is configured to serve from `main` branch root. Propagates in ~30 seconds.

## Design spec

See `docs/superpowers/specs/2026-04-24-ds-lite-portfolio-design.md`.
