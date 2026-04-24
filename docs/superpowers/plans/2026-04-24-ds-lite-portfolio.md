# DS Lite Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Nintendo DS Lite-themed personal portfolio as a static site on GitHub Pages, with a 3-frame animated pixel-art avatar, NS ORD countdown, and hash-based section routing.

**Architecture:** Single `index.html` with 5 hidden `<section>` elements swapped via JS on hash change. Layout = two stacked "screens" (top passive hero, bottom interactive nav+content). Vanilla HTML/CSS/JS, no build step, no framework. Google Fonts for typography. Avatar GIF built once as a preprocessing step via a short Python script using Pillow + rembg.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox), vanilla ES6 JS, Google Fonts (Press Start 2P, VT323, JetBrains Mono). One-off Python preprocessing: Pillow + rembg for GIF construction. Deployment: GitHub Pages from `main` branch root.

**Reference spec:** `docs/superpowers/specs/2026-04-24-ds-lite-portfolio-design.md`

---

## File Structure

**Files to create (in repo root):**
- `index.html` — single-page site with all 5 sections
- `styles.css` — all styles (chrome, top screen, bottom screen, mobile media query)
- `main.js` — section switching, hash routing, keyboard nav, ORD countdown
- `README.md` — repo description, live URL, development notes
- `.gitignore` — ignore `.superpowers/`, `.DS_Store`, `scripts/` build artifacts
- `fishing.gif` — 3-frame animated avatar (built from `fishing.png`)

**Files copied to repo root:**
- `resume.pdf` — renamed from `Resume_final (1).pdf`
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest` — from existing `favicon_io/`

**One-off build script (not shipped):**
- `scripts/build_avatar.py` — splits `fishing.png`, removes backgrounds, assembles `fishing.gif`. Kept for reproducibility.

**Source files retained (not shipped to Pages, but kept in repo):**
- `fishing.png` — original source for the avatar
- `favicon_io/` — original favicon asset bundle
- `docs/` — spec + plan

---

### Task 1: Initialize repo, copy assets, set up structure

**Files:**
- Create: `/Users/CJ/Documents/personal_website/.gitignore`
- Create: `/Users/CJ/Documents/personal_website/resume.pdf` (copy from existing)
- Copy: `favicon_io/*` → root
- Git init

- [ ] **Step 1: Initialize git repository**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git init -b main
```

Expected: `Initialized empty Git repository in /Users/CJ/Documents/personal_website/.git/`

- [ ] **Step 2: Copy favicon assets to root**

Run:
```bash
cd /Users/CJ/Documents/personal_website
cp favicon_io/favicon.ico .
cp favicon_io/favicon-16x16.png .
cp favicon_io/favicon-32x32.png .
cp favicon_io/apple-touch-icon.png .
cp favicon_io/android-chrome-192x192.png .
cp favicon_io/android-chrome-512x512.png .
cp favicon_io/site.webmanifest .
```

- [ ] **Step 3: Copy resume to root**

Run:
```bash
cd /Users/CJ/Documents/personal_website
cp "Resume_final (1).pdf" resume.pdf
```

- [ ] **Step 4: Create .gitignore**

Write `/Users/CJ/Documents/personal_website/.gitignore`:

```
# macOS
.DS_Store

# Superpowers brainstorm scratch
.superpowers/

# Python (for build script venv)
__pycache__/
*.pyc
.venv/
venv/

# Editor
.vscode/
.idea/

# Build script intermediate files
scripts/frames/
```

- [ ] **Step 5: Verify repo state**

Run: `cd /Users/CJ/Documents/personal_website && ls -la`

Expected: See `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`, `resume.pdf`, `.gitignore`, `fishing.png`, existing `docs/`, `favicon_io/`, `Resume_final (1).pdf`.

- [ ] **Step 6: Initial commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add .gitignore favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png site.webmanifest resume.pdf
git add fishing.png favicon_io/ docs/
git commit -m "chore: initialize repo with static assets and spec"
```

Expected: Commit succeeds. Run `git log --oneline` — see the initial commit.

---

### Task 2: Build animated fishing.gif avatar

**Files:**
- Create: `scripts/build_avatar.py`

**Background:** `fishing.png` is a 3-panel storyboard (cast → hook → catch). We split it into 3 equal frames, drop the black dividers, remove the sky/sea/rock background via `rembg` so the character floats on transparency, then combine into a looping GIF.

- [ ] **Step 1: Inspect source image dimensions**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -c "from PIL import Image; im = Image.open('fishing.png'); print(im.size)"
```

Expected: Prints a tuple like `(600, 450)` or similar. Note the width — we divide it by 3 for panel width.

If `PIL` not installed:
```bash
python3 -m pip install --user pillow rembg onnxruntime
```

- [ ] **Step 2: Write the build script**

Write `/Users/CJ/Documents/personal_website/scripts/build_avatar.py`:

```python
"""Build fishing.gif from fishing.png.

Splits the 3-panel source storyboard, strips panel dividers, removes
the background via rembg, and assembles a looping GIF.

One-off — run only when fishing.png changes. Output: fishing.gif (repo root).
"""

from pathlib import Path
from PIL import Image
from rembg import remove

REPO = Path(__file__).parent.parent
SRC = REPO / "fishing.png"
OUT = REPO / "fishing.gif"
FRAME_DIR = REPO / "scripts" / "frames"

FRAME_MS = 500  # per frame
PANELS = 3
# Pixel padding to trim off the black panel borders after splitting.
# Tune if the source image's borders are wider/thinner.
BORDER_CROP = 6


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    panel_w = w // PANELS
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    frames: list[Image.Image] = []
    for i in range(PANELS):
        left = i * panel_w + BORDER_CROP
        right = (i + 1) * panel_w - BORDER_CROP
        top = BORDER_CROP
        bottom = h - BORDER_CROP
        panel = src.crop((left, top, right, bottom))
        cut = remove(panel)  # returns RGBA with transparent background
        # Save intermediate frame for inspection
        (FRAME_DIR / f"frame_{i}.png").write_bytes(b"")  # placeholder; overwritten
        cut.save(FRAME_DIR / f"frame_{i}.png")
        frames.append(cut)

    # Resize all frames to match the smallest dimensions (they may differ by 1-2px)
    min_w = min(f.width for f in frames)
    min_h = min(f.height for f in frames)
    frames = [f.resize((min_w, min_h), Image.NEAREST) for f in frames]

    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        disposal=2,
        transparency=0,
    )
    print(f"Wrote {OUT} ({min_w}x{min_h}, {len(frames)} frames @ {FRAME_MS}ms)")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run the build script**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 scripts/build_avatar.py
```

Expected: First run downloads the `u2net` model (~180MB, one-time). Final output: `Wrote /Users/CJ/Documents/personal_website/fishing.gif (WxH, 3 frames @ 500ms)`.

- [ ] **Step 4: Visually verify the GIF**

Run:
```bash
open /Users/CJ/Documents/personal_website/fishing.gif
```

Expected: macOS Preview opens. Confirm:
- Three distinct frames cycle (cast → fish caught → holding fish).
- Background is transparent (the character sits on a grey checkerboard or solid Preview background, not sky/sea).
- No black dividers on the edges.

If the borders weren't fully trimmed, increase `BORDER_CROP` in the script and re-run.
If the bg removal is messy, the model sometimes keeps fragments — acceptable for a 72px rendered avatar, but if bad, try `from rembg import new_session; session = new_session("isnet-general-use")` and pass `session=session` to `remove()`.

- [ ] **Step 5: Commit the GIF and build script**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add scripts/build_avatar.py fishing.gif
git commit -m "feat: build animated fishing.gif avatar from 3-panel source"
```

---

### Task 3: HTML skeleton with font + favicon links

**Files:**
- Create: `/Users/CJ/Documents/personal_website/index.html`

- [ ] **Step 1: Write index.html skeleton**

Write `/Users/CJ/Documents/personal_website/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Duanmu Chuanjie — poppet-t</title>
  <meta name="description" content="Personal site of Duanmu Chuanjie (poppet-t) — security researcher & CTF player based in Singapore.">

  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="chrome">
    <div class="tag tag-top">
      <span>POPPET-T.GITHUB.IO</span>
      <span id="clock">--:-- · SGT</span>
    </div>

    <!-- TOP SCREEN (passive hero) -->
    <section class="screen screen-top" aria-label="Hero">
      <div class="hero-text">
        <h1 class="hero-name">DUANMU<br>CHUANJIE</h1>
        <ul class="hero-lines">
          <li><span class="dim">&gt;</span> security researcher &amp; CTF player</li>
          <li><span class="dim">&gt;</span> Singapore</li>
          <li><span class="dim">&gt;</span> <span class="label">now:</span> serving national service · ORD in <span id="ord-days">—</span> days</li>
          <li><span class="dim">&gt;</span> <span class="label">personal:</span> web-engine VR + AI dev</li>
        </ul>
        <div class="ticker">
          <span class="live">●</span> TISC 2025 · 15th/1515 &nbsp;·&nbsp; GreyCTF · 12th &nbsp;·&nbsp; ICO 2025 · Silver (int'l 34)
        </div>
      </div>
      <div class="avatar">
        <img src="/fishing.gif" alt="Pixel art of Duanmu Chuanjie fishing" width="72" height="72">
      </div>
    </section>

    <!-- BOTTOM SCREEN (interactive) -->
    <section class="screen screen-bottom" aria-label="Navigation and content">
      <nav class="nav" aria-label="Primary">
        <button class="tile" data-section="about">about</button>
        <button class="tile" data-section="work">work</button>
        <button class="tile" data-section="research">research</button>
        <button class="tile" data-section="ctf">ctf</button>
        <button class="tile" data-section="contact">contact</button>
      </nav>

      <div class="content">
        <article class="section" data-section="about" hidden></article>
        <article class="section" data-section="work" hidden></article>
        <article class="section" data-section="research" hidden></article>
        <article class="section" data-section="ctf" hidden></article>
        <article class="section" data-section="contact" hidden></article>
      </div>

      <div class="hint">↑↓ OR CLICK TO SWITCH SECTION</div>
    </section>

    <div class="tag tag-bottom">
      <span>▰ ▱ ▱ ▱</span>
    </div>
  </main>

  <script src="/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML in browser**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected: Blank page (no CSS yet). No 404 errors in the browser console or Python server log for `favicon.ico`, `fishing.gif`, `site.webmanifest`.

Kill the server afterwards: `kill %1` (or the most recent background job).

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html
git commit -m "feat: add HTML skeleton with fonts, favicon, and section slots"
```

---

### Task 4: Base styles — chrome, palette, fonts

**Files:**
- Create: `/Users/CJ/Documents/personal_website/styles.css`

- [ ] **Step 1: Write base CSS (variables, reset, chrome)**

Write `/Users/CJ/Documents/personal_website/styles.css`:

```css
/* ===== Tokens ===== */
:root {
  --shell: #1a1a1a;
  --shell-bg: #0a0a0a;
  --screen-bg: #050505;
  --fg: #8AFFA0;
  --fg-dim: #4a8a5a;
  --fg-deep: #2a5a35;
  --fg-highlight: #e0ffa0;
  --border: #1a3a1f;
  --border-strong: #2a2a2a;

  --font-pixel: "Press Start 2P", monospace;
  --font-crt: "VT323", monospace;
  --font-body: "JetBrains Mono", ui-monospace, monospace;
}

/* ===== Reset ===== */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--shell-bg);
  color: var(--fg);
  font-family: var(--font-body);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
img { display: block; image-rendering: pixelated; }
ul { list-style: none; padding: 0; margin: 0; }
a { color: var(--fg); text-decoration: none; border-bottom: 1px dotted var(--fg-dim); }
a:hover { color: var(--fg-highlight); border-bottom-color: var(--fg-highlight); }

/* ===== Chrome ===== */
.chrome {
  background: var(--shell);
  border: 2px solid var(--border-strong);
  border-radius: 10px;
  padding: 12px;
  width: 100%;
  max-width: 720px;
  box-shadow: inset -1px -1px 0 var(--border-strong), 0 0 20px rgba(138,255,160,0.06);
}

.tag {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: #5a5a5a;
  letter-spacing: 1px;
  display: flex;
  justify-content: space-between;
  padding: 2px 4px;
}
.tag-top { margin-bottom: 8px; }
.tag-bottom {
  justify-content: center;
  color: var(--fg-deep);
  margin-top: 4px;
}

/* ===== Screens ===== */
.screen {
  background: var(--screen-bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: inset 0 0 20px rgba(138,255,160,0.04);
  position: relative;
}
```

- [ ] **Step 2: Verify in browser**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected:
- Dark onyx frame centered on the page.
- Pixel-font tag "POPPET-T.GITHUB.IO" at top, "▰ ▱ ▱ ▱" at bottom.
- Two dark screen panels stacked, empty.
- No layout issues in narrow/wide browsers.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add styles.css
git commit -m "feat(css): base tokens, reset, and chrome frame"
```

---

### Task 5: Top-screen hero styles

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/styles.css` (append)

- [ ] **Step 1: Append hero styles**

Append to `/Users/CJ/Documents/personal_website/styles.css`:

```css
/* ===== Top screen (hero) ===== */
.screen-top {
  min-height: 140px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
}

.hero-name {
  font-family: var(--font-pixel);
  font-size: clamp(14px, 3.5vw, 20px);
  color: var(--fg);
  line-height: 1.6;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.hero-lines {
  font-family: var(--font-crt);
  font-size: 16px;
  color: #6acc7a;
  line-height: 1.35;
  margin-bottom: 10px;
}
.hero-lines li { padding: 1px 0; }
.hero-lines .dim { color: var(--fg-deep); }
.hero-lines .label { color: var(--fg); }

.ticker {
  font-family: var(--font-crt);
  font-size: 14px;
  color: var(--fg-dim);
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}
.ticker .live {
  color: var(--fg);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.avatar {
  width: 72px;
  height: 72px;
  border: 1px solid var(--border);
  background: rgba(138,255,160,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar img { width: 100%; height: 100%; object-fit: contain; }
```

- [ ] **Step 2: Verify**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected:
- "DUANMU CHUANJIE" displayed in chunky pixel font (Press Start 2P).
- 4 bullet lines in green VT323.
- ORD days shows "—" (placeholder; JS not written yet).
- Ticker line at bottom of top screen, `●` pulses.
- Fishing GIF avatar on the right side, animating through 3 frames.
- No layout breakage.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add styles.css
git commit -m "feat(css): top screen hero layout and ticker"
```

---

### Task 6: Bottom-screen nav bar styles

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/styles.css` (append)

- [ ] **Step 1: Append nav styles**

Append to `/Users/CJ/Documents/personal_website/styles.css`:

```css
/* ===== Bottom screen ===== */
.screen-bottom { min-height: 240px; }

.nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-bottom: 14px;
}

.tile {
  font-family: var(--font-crt);
  font-size: 15px;
  border: 1px solid var(--border);
  padding: 8px 4px;
  text-align: center;
  color: var(--fg-dim);
  transition: color 120ms, border-color 120ms, background 120ms;
}
.tile:hover {
  color: var(--fg);
  border-color: var(--fg);
}
.tile[aria-current="true"] {
  color: var(--fg);
  border-color: var(--fg);
  background: rgba(138,255,160,0.06);
}

.hint {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-family: var(--font-pixel);
  font-size: 6px;
  color: var(--fg-deep);
  letter-spacing: 1px;
}

/* ===== Sections (content) ===== */
.content { padding-bottom: 24px; }

.section[hidden] { display: none; }
.section { animation: fade 160ms ease-out; }
@keyframes fade {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.section h2 {
  font-family: var(--font-pixel);
  font-size: 9px;
  color: var(--fg);
  margin: 0 0 10px 0;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 6px;
  letter-spacing: 1px;
}

.section h3 {
  font-family: var(--font-crt);
  font-size: 16px;
  color: var(--fg);
  margin: 12px 0 4px 0;
}

.section p, .section li {
  font-family: var(--font-body);
  font-size: 11px;
  line-height: 1.6;
}

.section ul.bullets { margin: 6px 0; }
.section ul.bullets li {
  padding-left: 14px;
  position: relative;
}
.section ul.bullets li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: var(--fg-dim);
}

.section .meta {
  font-family: var(--font-crt);
  font-size: 13px;
  color: var(--fg-dim);
  margin-bottom: 4px;
}

.section .acc { color: var(--fg-highlight); }
```

- [ ] **Step 2: Verify**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected:
- 5 nav tiles across the bottom screen, each labeled.
- Hovering a tile brightens its border/text.
- No section content yet (all `hidden`).
- "↑↓ OR CLICK TO SWITCH SECTION" hint in bottom-right.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add styles.css
git commit -m "feat(css): bottom screen navigation tiles and section scaffolding"
```

---

### Task 7: About section content

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/index.html` — fill in the `about` section.

- [ ] **Step 1: Fill in the About section**

In `/Users/CJ/Documents/personal_website/index.html`, replace:

```html
<article class="section" data-section="about" hidden></article>
```

with:

```html
<article class="section" data-section="about" hidden>
  <h2>▓ ABOUT</h2>
  <p>Duanmu Chuanjie — security researcher, CTF player, and student based in Singapore. I build things, break things (with permission), and occasionally publish findings.</p>

  <h3>Education</h3>
  <p class="meta">River Valley High School · graduated Oct 2025</p>
  <ul class="bullets">
    <li>Coursework: H2 Physics, Geography, Economics, Mathematics; H1 Chinese, GP, PW</li>
    <li><span class="acc">RVHS Colours Award</span> for Co-curricular Excellence</li>
  </ul>

  <h3>Skills</h3>
  <ul class="bullets">
    <li><span class="acc">Programming:</span> Python, Ruby, C/C++, Assembly, SageMath, LaTeX</li>
    <li><span class="acc">Cybersecurity:</span> Vulnerability Research (fuzzing, reversing), Penetration Testing, CTF</li>
    <li><span class="acc">Tools:</span> Radare2, Ghidra, IDA Pro, WinDbg, Kali Linux, CAD, KLayout, 3D Printing (Resin/FDM)</li>
    <li><span class="acc">Laboratory:</span> Optical Lithography, Semiconductor Design/Testing, Microscopy</li>
    <li><span class="acc">Languages:</span> English, Mandarin Chinese, German (A1)</li>
  </ul>
</article>
```

- [ ] **Step 2: Verify by temporarily un-hiding**

Edit `index.html` temporarily — change the About section's `hidden` attribute to visible, i.e., remove `hidden`:

```html
<article class="section" data-section="about">
```

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected: About content displays with correct typography (pixel title, CRT headings, mono body, `▸` bullets).

Re-add `hidden` before committing. Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html
git commit -m "feat(content): about section — bio, education, skills"
```

---

### Task 8: Work section content

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/index.html` — fill in the `work` section.

- [ ] **Step 1: Fill in the Work section**

Replace:

```html
<article class="section" data-section="work" hidden></article>
```

with:

```html
<article class="section" data-section="work" hidden>
  <h2>▓ WORK</h2>

  <h3>National Service (SG)</h3>
  <p class="meta">Apr 2026 – Apr 2028 · currently serving</p>
  <ul class="bullets">
    <li>Full-time NSF.</li>
  </ul>

  <h3>zcloak network .ltd</h3>
  <p class="meta">Intern, Full-Stack Development &amp; AI Security Research · Jan 2026 – Apr 2026</p>
  <ul class="bullets">
    <li>Shipped full-stack features for internal products: frontend UI, backend APIs/services, database integration.</li>
    <li>Researched LLM security (prompt injection, model risk analysis) and evaluated mitigations for practical deployments.</li>
  </ul>

  <h3>Charms and Links</h3>
  <p class="meta">Tech support &amp; site creator · Nov 2024 – Present · <a href="https://www.charmsandlinks.com/" target="_blank" rel="noopener">charmsandlinks.com</a></p>
  <ul class="bullets">
    <li>E-commerce site for handmade jewellery.</li>
    <li>Built with <span class="acc">Ruby on Rails</span> + <span class="acc">TailwindCSS</span>.</li>
  </ul>
</article>
```

- [ ] **Step 2: Verify (temporarily un-hide, check, re-hide)**

Same process as Task 7, Step 2. Confirm layout renders cleanly, links are green.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html
git commit -m "feat(content): work section — NS, zcloak, Charms and Links"
```

---

### Task 9: Research section content

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/index.html` — fill in the `research` section.

- [ ] **Step 1: Fill in the Research section**

Replace:

```html
<article class="section" data-section="research" hidden></article>
```

with:

```html
<article class="section" data-section="research" hidden>
  <h2>▓ RESEARCH</h2>

  <h3>Vulnerability Research (independent)</h3>
  <p class="meta">Jul 2025 – Present</p>
  <ul class="bullets">
    <li>Discovered and reported vulnerabilities in web engines — <span class="acc">QuickJS-NG</span>, <span class="acc">WASM3</span>.</li>
  </ul>

  <h3>NTU SpiNlabs — Spin &amp; Nanostructures Lab</h3>
  <p class="meta">Student Researcher · Nanyang Research Programme · Mar 2024 – Jan 2025</p>
  <ul class="bullets">
    <li>Designed and fabricated 130+ micron-scale spintronic devices via optical lithography.</li>
    <li>Wrote a fabrication optimisation paper.</li>
    <li>Co-authored a paper validating a 2022 lab simulation on domain wall pinning.</li>
  </ul>

  <h3>NTU — Machine Learning for Maritime Safety</h3>
  <p class="meta">Student Researcher · Nanyang Research Programme · Sep 2024 – Jan 2025</p>
  <ul class="bullets">
    <li>Co-authored a paper on container-ship risk prediction using XGBoost (<span class="acc">R² = 0.60</span>).</li>
    <li>Built PSC data pipelines (cleaning, feature engineering, preprocessing) using PyTorch, NumPy, TensorFlow.</li>
  </ul>
</article>
```

- [ ] **Step 2: Verify**

Same process (un-hide, check, re-hide).

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html
git commit -m "feat(content): research section — vuln research, NTU spintronics, maritime ML"
```

---

### Task 10: CTF section content

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/index.html` — fill in the `ctf` section.
- Modify: `/Users/CJ/Documents/personal_website/styles.css` — add featured-card styles.

- [ ] **Step 1: Append CTF-specific styles**

Append to `/Users/CJ/Documents/personal_website/styles.css`:

```css
/* ===== CTF featured cards ===== */
.featured {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin: 8px 0 14px 0;
}
.featured .card {
  border: 1px solid var(--fg);
  padding: 8px;
  background: rgba(138,255,160,0.04);
}
.featured .card .event {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--fg);
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.featured .card .result {
  font-family: var(--font-crt);
  font-size: 16px;
  color: var(--fg-highlight);
}
.featured .card .sub {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--fg-dim);
  margin-top: 2px;
}

.ctf-others {
  font-family: var(--font-crt);
  font-size: 14px;
  color: var(--fg-dim);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 6px 0 14px 0;
}
.ctf-others .acc { color: var(--fg); }
```

- [ ] **Step 2: Fill in the CTF section**

Replace:

```html
<article class="section" data-section="ctf" hidden></article>
```

with:

```html
<article class="section" data-section="ctf" hidden>
  <h2>▓ CTF &amp; CRYPTO</h2>

  <div class="featured">
    <div class="card">
      <div class="event">TISC 2025</div>
      <div class="result">15th / 1515</div>
      <div class="sub">Level 9 · CSIT</div>
    </div>
    <div class="card">
      <div class="event">GREYCTF</div>
      <div class="result">12th</div>
      <div class="sub">NTU / Grey Hats</div>
    </div>
    <div class="card">
      <div class="event">ICO 2025</div>
      <div class="result">Silver</div>
      <div class="sub">Int'l rank 34 · National Gold, rank 8</div>
    </div>
  </div>

  <h3>Other CTF results</h3>
  <ul class="ctf-others">
    <li>GryphonsCTF · <span class="acc">2nd</span></li>
    <li>BlahajCTF · <span class="acc">5th</span></li>
    <li>Lag and Crash CTF · <span class="acc">6th</span></li>
    <li>YBNCTF 2025 · <span class="acc">3rd</span></li>
    <li>Whitehacks · 9th</li>
  </ul>

  <h3>Cryptography &amp; teaching</h3>
  <ul class="bullets">
    <li>Head, Cryptography Interest Group — RVHS Mathematics Leaders Academy (Sep 2024 – May 2025). Researched and taught lessons on asymmetric cryptography (RSA, ECC) with problem sets.</li>
    <li>Vice-President, RVHS Infocomm Club (RVCTF) — May 2024 – May 2025. Developed and delivered a cybersecurity curriculum with hands-on challenges; built the club website and vulnerable-by-design training apps.</li>
    <li>Profile: <a href="https://cryptohack.org/user/poppet_t/" target="_blank" rel="noopener">cryptohack.org/user/poppet_t</a></li>
  </ul>

  <h3>Selective programmes</h3>
  <ul class="bullets">
    <li>CSIT Youth Talent Programme — Windows Kernel Vulnerability Research &amp; Pentest.</li>
    <li>DSO YDSP World of Science (AI).</li>
  </ul>
</article>
```

- [ ] **Step 3: Verify**

Same process. Confirm:
- 3 featured cards render in a row with "15th / 1515", "12th", "Silver".
- "Other CTF results" wraps inline.
- Subsequent sub-sections render cleanly.

- [ ] **Step 4: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html styles.css
git commit -m "feat(content): ctf section — featured cards + full results + crypto teaching"
```

---

### Task 11: Contact section content

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/index.html` — fill in the `contact` section.

- [ ] **Step 1: Fill in the Contact section**

Replace:

```html
<article class="section" data-section="contact" hidden></article>
```

with:

```html
<article class="section" data-section="contact" hidden>
  <h2>▓ CONTACT</h2>
  <ul class="bullets">
    <li><span class="acc">email:</span> <a href="mailto:dmcjisalive@gmail.com">dmcjisalive@gmail.com</a></li>
    <li><span class="acc">github:</span> <a href="https://github.com/poppet-t" target="_blank" rel="noopener">github.com/poppet-t</a></li>
    <li><span class="acc">linkedin:</span> <a href="https://www.linkedin.com/in/chuanjie-duanmu-7901b9256/" target="_blank" rel="noopener">linkedin.com/in/chuanjie-duanmu-7901b9256</a></li>
    <li><span class="acc">cryptohack:</span> <a href="https://cryptohack.org/user/poppet_t/" target="_blank" rel="noopener">cryptohack.org/user/poppet_t</a></li>
    <li><span class="acc">resume:</span> <a href="/resume.pdf" target="_blank" rel="noopener">download PDF</a></li>
  </ul>
  <p style="margin-top: 14px; color: var(--fg-dim);">— best reached by email.</p>
</article>
```

- [ ] **Step 2: Verify**

Same process.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add index.html
git commit -m "feat(content): contact section with links and resume download"
```

---

### Task 12: JS — section switching, hash routing, keyboard nav

**Files:**
- Create: `/Users/CJ/Documents/personal_website/main.js`

- [ ] **Step 1: Write main.js (section switching + hash + keyboard)**

Write `/Users/CJ/Documents/personal_website/main.js`:

```javascript
(() => {
  "use strict";

  const SECTIONS = ["about", "work", "research", "ctf", "contact"];
  const DEFAULT_SECTION = "about";

  const tiles = Array.from(document.querySelectorAll(".tile[data-section]"));
  const sections = Array.from(document.querySelectorAll(".section[data-section]"));

  function sectionFromHash() {
    const raw = location.hash.replace(/^#/, "").trim();
    return SECTIONS.includes(raw) ? raw : DEFAULT_SECTION;
  }

  function activate(name) {
    if (!SECTIONS.includes(name)) name = DEFAULT_SECTION;
    for (const t of tiles) {
      const match = t.dataset.section === name;
      t.setAttribute("aria-current", match ? "true" : "false");
    }
    for (const s of sections) {
      const match = s.dataset.section === name;
      s.hidden = !match;
    }
    if (location.hash.replace(/^#/, "") !== name) {
      history.replaceState(null, "", `#${name}`);
    }
  }

  function cycleTile(delta) {
    const current = sectionFromHash();
    const idx = SECTIONS.indexOf(current);
    const next = SECTIONS[(idx + delta + SECTIONS.length) % SECTIONS.length];
    activate(next);
  }

  // Tile clicks
  for (const t of tiles) {
    t.addEventListener("click", () => activate(t.dataset.section));
  }

  // Keyboard nav (← / →)
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight") { e.preventDefault(); cycleTile(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); cycleTile(-1); }
  });

  // Hash change (browser back/forward)
  window.addEventListener("hashchange", () => activate(sectionFromHash()));

  // Initial activation
  activate(sectionFromHash());
})();
```

- [ ] **Step 2: Verify**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected:
- On load, About section is visible; About tile is highlighted (border + text in bright green, slightly tinted bg).
- Clicking each tile swaps the content and updates the URL (`#work`, `#ctf`, etc.).
- Arrow keys ← → cycle through tiles.
- URL like `http://localhost:8000/#ctf` opens the site with CTF active.
- Browser back/forward navigates between sections.
- No console errors.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add main.js
git commit -m "feat(js): section switching, hash routing, and keyboard navigation"
```

---

### Task 13: JS — ORD countdown and clock

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/main.js` (append).

- [ ] **Step 1: Append countdown + clock logic**

Append to `/Users/CJ/Documents/personal_website/main.js` (before the final `})();`):

Replace the final line `})();` by editing the file so it now ends with:

```javascript
  // ---- ORD countdown ----
  const ORD = new Date("2028-04-06T00:00:00+08:00"); // SGT
  const ordEl = document.getElementById("ord-days");

  function updateOrd() {
    const now = Date.now();
    const days = Math.max(0, Math.ceil((ORD.getTime() - now) / 86400000));
    if (ordEl) ordEl.textContent = days.toString();
  }
  updateOrd();
  setInterval(updateOrd, 60 * 60 * 1000); // hourly

  // ---- Clock (top tag) ----
  const clockEl = document.getElementById("clock");

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    clockEl.textContent = `██ ${hh}:${mm} · SGT`;
  }
  updateClock();
  setInterval(updateClock, 30 * 1000);
})();
```

- [ ] **Step 2: Verify**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Expected:
- ORD line shows a number (e.g., "712 days" as of today).
- Top-right tag shows current time, e.g. `██ 14:37 · SGT`.
- Both update over time (check again after a minute — clock should advance).
- No console errors.

Sanity check the countdown math in the browser console:
```javascript
Math.ceil((new Date("2028-04-06T00:00:00+08:00") - Date.now()) / 86400000)
```
Expected: matches the number shown on the page.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add main.js
git commit -m "feat(js): ORD countdown and SGT clock"
```

---

### Task 14: Mobile responsive styles

**Files:**
- Modify: `/Users/CJ/Documents/personal_website/styles.css` (append).

- [ ] **Step 1: Append mobile media query**

Append to `/Users/CJ/Documents/personal_website/styles.css`:

```css
/* ===== Mobile ===== */
@media (max-width: 700px) {
  body { padding: 10px; }

  .chrome { padding: 8px; }

  .screen-top {
    grid-template-columns: 1fr;
    text-align: left;
  }
  .screen-top .avatar {
    width: 56px;
    height: 56px;
    margin-left: 0;
    align-self: start;
    order: -1;
  }
  .hero-name { font-size: 14px; }
  .hero-lines { font-size: 14px; }
  .ticker { font-size: 12px; }

  .nav {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
  }
  .tile { font-size: 13px; padding: 8px 2px; }

  .featured { grid-template-columns: 1fr; }

  .hint { font-size: 5px; }
}

@media (max-width: 380px) {
  .nav { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 2: Verify mobile layout**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Open browser DevTools → responsive mode → test widths 320px, 500px, 700px, 1024px.

Expected:
- At 320px: nav is 2 columns (about/work | research/ctf | contact — reflowed), content legible, no horizontal scrolling.
- At 500px: nav is 3 columns.
- At 700px+: nav is 5 columns across.
- Hero avatar moves above name on narrow widths.
- Featured CTF cards stack vertically on mobile.

Kill the server: `kill %1`.

- [ ] **Step 3: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add styles.css
git commit -m "feat(css): mobile responsive layout (<=700px, <=380px)"
```

---

### Task 15: README and deployment readiness

**Files:**
- Create: `/Users/CJ/Documents/personal_website/README.md`

- [ ] **Step 1: Write the README**

Write `/Users/CJ/Documents/personal_website/README.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

Run:
```bash
cd /Users/CJ/Documents/personal_website
git add README.md
git commit -m "docs: add README with stack, local dev, and deployment notes"
```

---

### Task 16: Final polish pass and full-site QA

**Files:** none (verification only)

- [ ] **Step 1: Boot server and do an end-to-end walkthrough**

Run:
```bash
cd /Users/CJ/Documents/personal_website
python3 -m http.server 8000 &
open http://localhost:8000
```

Verification checklist (check each item):

- [ ] Hero renders: name in pixel font, 4 bullet lines, ticker, fishing GIF animates.
- [ ] ORD countdown shows a realistic day count.
- [ ] Clock in top-right updates.
- [ ] Click each tile: about, work, research, ctf, contact. Each displays correct content without layout issues.
- [ ] URL hash updates as tiles are clicked.
- [ ] Arrow keys ← → cycle through tiles.
- [ ] Reload with `#ctf` in URL → page loads directly to CTF section.
- [ ] All external links open in new tab and point to correct URLs (LinkedIn, GitHub, CryptoHack, Charms and Links).
- [ ] `resume.pdf` link opens/downloads the PDF.
- [ ] All 3 featured CTF cards display correctly (TISC, GreyCTF, ICO).
- [ ] "Other CTF results" includes YBNCTF 2025 — 3rd.
- [ ] No console errors.
- [ ] Favicon appears in browser tab (servo skull).

Test mobile via DevTools responsive mode:
- [ ] 320px: no horizontal scroll, nav wraps, content legible.
- [ ] 500px, 700px, 1200px: layout scales cleanly.

Kill server: `kill %1`.

- [ ] **Step 2: Fix anything broken**

If any checklist item fails, make a targeted fix, commit with a clear message, and re-run the checklist. Do not mark this task complete until every item passes.

- [ ] **Step 3: No-op commit to mark QA complete (optional)**

Only commit here if fixes were made. If everything passed on first try, skip.

---

### Task 17: Push to GitHub and enable Pages

**Files:** none (remote setup)

**Precondition:** User has a GitHub account as `poppet-t`.

- [ ] **Step 1: Create the GitHub repo**

Run:
```bash
cd /Users/CJ/Documents/personal_website
gh repo create poppet-t/poppet-t.github.io --public --source=. --remote=origin --push
```

If `gh` not authenticated, first run `gh auth login` (this is an interactive step — the user must run it themselves). If `gh` not installed, the user can create the repo via web UI at https://github.com/new with name `poppet-t.github.io`, then:

```bash
cd /Users/CJ/Documents/personal_website
git remote add origin https://github.com/poppet-t/poppet-t.github.io.git
git push -u origin main
```

Expected: Repo created, `main` pushed.

- [ ] **Step 2: Enable GitHub Pages**

Via `gh`:
```bash
gh api -X POST /repos/poppet-t/poppet-t.github.io/pages \
  -f 'source[branch]=main' \
  -f 'source[path]=/'
```

Or via web UI: repo → Settings → Pages → Source = Deploy from a branch → Branch = `main`, folder = `/ (root)` → Save.

- [ ] **Step 3: Verify the live site**

Wait ~30–60 seconds, then:

```bash
open https://poppet-t.github.io
```

Expected: The live site matches the local version. Verify:
- [ ] Fonts load (no FOUC or fallback monospace on the hero name).
- [ ] `fishing.gif` animates.
- [ ] All sections reachable via hash.
- [ ] Favicon visible.

If fonts don't load: check browser console for CORS/CSP issues and verify the `<link>` to Google Fonts.
If `fishing.gif` is broken: verify it's tracked in git (`git ls-files | grep fishing.gif`) — it's binary and should be fine, but large GIFs can be missed.
If favicon 404s: confirm the icons are in the repo root, not only in `favicon_io/`.

- [ ] **Step 4: Final commit on README with the live URL confirmed**

If needed, touch up the README (e.g., add live URL if it wasn't right) and push.

---

## Self-Review

**Spec coverage check:**
- ✅ Dual-screen layout → Tasks 4–6
- ✅ Onyx + soft green palette → Task 4 (CSS variables)
- ✅ Three-font typography → Task 3 (HTML), Task 4 (CSS tokens)
- ✅ Top screen content (hero, ticker, avatar, countdown) → Tasks 3, 5, 13
- ✅ Five nav tiles → Tasks 3, 6
- ✅ All 5 section contents → Tasks 7–11
- ✅ Featured CTF cards (TISC, GreyCTF, ICO) → Task 10
- ✅ YBNCTF 2025 3rd in "Other" list → Task 10
- ✅ Section switching + hash routing + keyboard nav → Task 12
- ✅ ORD countdown with 2028-04-06 → Task 13
- ✅ SGT clock → Task 13
- ✅ Mobile responsive layout → Task 14
- ✅ Animated fishing.gif from fishing.png → Task 2
- ✅ Servo skull favicon (from favicon_io) → Task 1, Task 3
- ✅ Resume PDF download → Task 1, Task 11
- ✅ GitHub Pages deployment → Task 17
- ✅ No build step, no framework → entire plan is vanilla HTML/CSS/JS
- ✅ Link set: email, GitHub, LinkedIn, CryptoHack, resume → Task 11

**Placeholder scan:** No TBDs, no "implement error handling", no "similar to Task N". Each step has full code or an exact command.

**Type/name consistency:**
- Section ids: `about`, `work`, `research`, `ctf`, `contact` — consistent across HTML (`data-section`), CSS, and JS (`SECTIONS` array).
- Element ids: `#ord-days`, `#clock` — defined in Task 3 HTML, referenced in Task 13 JS. Match.
- CSS class names used across tasks — `.chrome`, `.screen`, `.screen-top`, `.screen-bottom`, `.tile`, `.section`, `.hero-*`, `.featured`, `.ctf-others`, `.bullets`, `.meta`, `.acc` — all defined in CSS tasks and used in HTML tasks. Consistent.
- File paths (absolute) — consistent throughout.
