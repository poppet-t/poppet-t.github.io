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

## Writing a blog post

1. Create `posts/<slug>.md` with your content (standard Markdown, GFM tables and fenced code blocks supported).
2. Add an entry to `posts/index.json`:
   ```json
   {
     "slug": "your-slug",
     "title": "Your title",
     "date": "2026-04-24",
     "excerpt": "One sentence for the index listing."
   }
   ```
3. Commit and push. The post is live at `https://poppet-t.github.io/#blog/your-slug` once Pages re-deploys (~30s).

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
