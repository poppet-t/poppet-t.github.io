# DS Lite Portfolio — Design Spec

**Date:** 2026-04-24
**Owner:** Duanmu Chuanjie (poppet-t)
**Status:** Approved, ready for implementation plan

## Goal

A personal portfolio website hosted on GitHub Pages with a Nintendo DS Lite pixel-art aesthetic. Showcases cybersecurity / CTF / research work in a distinctive retro frame without sacrificing readability.

## Design direction

**Aesthetic:** Dual-screen DS layout. Two stacked "screens" on an onyx-black chrome — top screen is a passive hero panel, bottom screen is the interactive navigation + content area. No rendered hardware (no shell, hinge, or buttons) — the DS identity comes from the layout, typography, and palette, not hardware mimicry.

**Palette:**
- Shell / chrome: `#1a1a1a` (onyx black)
- Screen background: `#050505`
- Primary text & accent: `#8AFFA0` (soft green)
- Dimmed text: `#4a8a5a`
- Borders: `#1a3a1f`
- Highlight text (featured items): `#e0ffa0`

**Typography (Google Fonts):**
- `Press Start 2P` — headings, name, section titles (used sparingly; unreadable at paragraph length)
- `VT323` — ticker, nav tiles, chrome labels, hints
- `JetBrains Mono` — body content, lists, long-form text

## Layout

### Desktop (≥ 700px)

```
┌─── POPPET-T.GITHUB.IO ─────── 12:34 · SGT ──┐
│ ┌─ Top screen (hero, passive) ─────────────┐ │
│ │  DUANMU                  [pixel avatar]  │ │
│ │  CHUANJIE                                │ │
│ │  > security researcher & CTF player      │ │
│ │  > Singapore                             │ │
│ │  > now: serving NS · ORD in 712d         │ │
│ │  > personal: web-engine VR + AI dev      │ │
│ │  ── ticker: TISC · GreyCTF · ICO ──      │ │
│ └──────────────────────────────────────────┘ │
│ ┌─ Bottom screen (interactive) ────────────┐ │
│ │ [about][work][research][ctf][contact]    │ │
│ │ ▓ SECTION TITLE                          │ │
│ │  ▸ content                               │ │
│ │  ▸ content                               │ │
│ │  ▸ content                               │ │
│ │                    ↑↓ or click to switch │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Mobile (< 700px)

Same two screens, but nav tiles collapse from a 5-across row into a 2×3 grid. No hamburger menu — tiles stay visible.

## Top screen — hero (passive)

Two-column layout (left: text / right: pixel avatar).

**Left column:**
1. Name in `Press Start 2P` — two lines: "DUANMU" / "CHUANJIE"
2. Bullet lines in `VT323`:
   - `> security researcher & CTF player`
   - `> Singapore`
   - `> now: serving national service · ORD in {N} days`
   - `> personal: web-engine VR + AI dev`
3. Ticker strip (`VT323`, dimmer): rotating highlights — "TISC 2025 · 15th/1515 · ICO 2025 Silver · GryphonsCTF 2nd"

**ORD countdown:** `{N}` is computed client-side:
```js
Math.ceil((new Date('2028-04-06') - Date.now()) / 86400000)
```

**Ticker behavior:** Scrolls horizontally via CSS animation (infinite loop), or if simpler, static single-line with bullet separators. Default to static — the animation can feel gimmicky.

**Pixel avatar (right column):** 72×72 pixel-art graphic. Placeholder in mockup; actual art TBD (user can supply, or we can generate/commission later).

## Bottom screen — navigation + content

### Navigation bar

Five tiles, full-width row on desktop, 2×3 grid on mobile:

| Tile | Section |
|------|---------|
| `about` | Bio, education, skills |
| `work` | Employment (incl. NS, zcloak, Charms and Links) |
| `research` | Vuln research + NTU papers |
| `ctf` | CTF results + crypto teaching + leadership |
| `contact` | Links + resume download |

Active tile: border + text `#8AFFA0`, background `rgba(138,255,160,0.06)`.
Inactive tile: border `#1a3a1f`, text `#4a8a5a`.
Hover: border brightens to `#8AFFA0` (no background change).

### Content area

Beneath nav. Section content swaps in-place — no page reload. URL updates with a hash fragment (`#about`, `#ctf`, etc.) so sections are linkable/bookmarkable. On page load, the hash determines the initial section (default: `about`).

**Section layout pattern:**
- Section title in `Press Start 2P` size 9px, underlined with a dashed bottom border
- Content in `JetBrains Mono` size 11px, line-height 1.6
- Lists use `▸` bullets (not `•`), colored dim green `#4a8a5a`

## Per-section content

### `about`

- **Name / intro:** "Duanmu Chuanjie — security researcher, CTF player, student. Based in Singapore."
- **Education:** River Valley High School (graduated Oct 2025). RVHS Colours Award for Co-curricular Excellence.
- **Skills, grouped:**
  - *Programming:* Python, Ruby, C/C++, Assembly, SageMath, LaTeX
  - *Cybersecurity:* Vulnerability Research (fuzzing, reversing), Penetration Testing, CTF
  - *Tools:* Radare2, Ghidra, IDA Pro, WinDbg, Kali Linux, CAD, KLayout, 3D Printing
  - *Languages:* English, Mandarin, German (A1)

### `work`

In reverse-chronological order:

1. **National Service (SG)** · Apr 2026 – Apr 2028
   - `> Currently serving full-time.`
   - No unit/vocation details.
2. **zcloak network .ltd** · Jan 2026 – Apr 2026
   - Intern, Full-Stack Development & AI Security Research.
   - Shipped full-stack features for internal products.
   - Researched LLM security (prompt injection, model risk analysis).
3. **Charms and Links** · Nov 2024 – Present
   - Tech support & website creator.
   - E-commerce site for handmade jewellery.
   - Built with Ruby on Rails + TailwindCSS.
   - Link: https://www.charmsandlinks.com/

### `research`

1. **Vulnerability Research (independent)** · Jul 2025 – Present
   - Discovered and reported vulnerabilities in web engines — QuickJS-NG, WASM3.
2. **NTU SpiNlabs — Spin & Nanostructures Lab** · Mar 2024 – Jan 2025
   - Designed and fabricated 130+ micron-scale spintronic devices via optical lithography.
   - Wrote a fabrication optimisation paper.
   - Co-authored a paper validating a 2022 lab simulation on domain wall pinning.
3. **NTU — Machine Learning for Maritime Safety** · Sep 2024 – Jan 2025
   - Co-authored a paper on container-ship risk prediction using XGBoost (R²=0.60).
   - Built PSC data pipelines using PyTorch, NumPy, TensorFlow.

### `ctf`

**Featured (rendered as three prominent cards at the top):**
- **TISC 2025** — 15th / 1515, L9
- **GreyCTF** — 12th
- **ICO 2025** — Silver, international rank 34 (National Gold, rank 8)

**Other wins (compact list below featured):**
- GryphonsCTF — 2nd
- BlahajCTF — 5th
- Lag and Crash CTF — 6th
- YBNCTF 2025 — 3rd
- Whitehacks — 9th

**Teaching / leadership (inline below CTF results):**
- Vice-President, RVHS Infocomm Club (RVCTF), May 2024 – May 2025 — built curriculum, club website, training apps.
- Head, Cryptography Interest Group, RVHS MLA, Sep 2024 – May 2025 — taught RSA/ECC with problem sets.

**Profile link:** `cryptohack.org/user/poppet_t`

### `contact`

Plain links, one per line:

- email: `dmcjisalive@gmail.com`
- github: [`github.com/poppet-t`](https://github.com/poppet-t)
- linkedin: [`linkedin.com/in/chuanjie-duanmu-7901b9256`](https://www.linkedin.com/in/chuanjie-duanmu-7901b9256/)
- cryptohack: [`cryptohack.org/user/poppet_t`](https://cryptohack.org/user/poppet_t/)
- resume: [download PDF](./resume.pdf)

## Interactions

**Navigation:**
- Click tile → switches section, updates URL hash.
- Keyboard `←` / `→` → cycle through tiles.
- Keyboard `Enter` → no-op on hover, already active state on click.
- On load: URL hash determines active section (e.g., `/#ctf` opens CTF). Default `about`.

**Transitions:**
- Content fade (~150ms opacity transition) on section switch — subtle, not flashy.
- No loading states — everything is in-page.

**Hover:**
- Nav tiles: border brightens.
- Links in content: underline appears on hover, text color shifts to `#e0ffa0`.

**ORD countdown:**
- Computed once on load, re-computed every hour via `setInterval`. Doesn't need second-by-second precision.

## Tech stack

Vanilla HTML + CSS + tiny JS. No build step.

```
/
├── index.html          single-page site, all 5 sections as hidden <section> elements
├── styles.css          all styles, grouped by region (chrome, top, bottom, mobile)
├── main.js             section switching, countdown, hash routing
├── resume.pdf          downloadable resume
├── favicon.ico         16×16 pixel-art favicon
└── README.md           repo description, live URL
```

**JS responsibilities (`main.js`):**
1. Read `location.hash`, activate matching section on load.
2. Attach click handlers to nav tiles; on click, update hash and swap active section.
3. Keyboard handler for ←/→ cycling.
4. ORD countdown: compute on load + every hour.
5. Smooth fade on section switch.

No frameworks, no bundler, no npm. Single `<script>` tag loading `main.js`.

**Fonts:** Google Fonts link in `<head>` loading Press Start 2P, VT323, and JetBrains Mono.

## Deployment

- **Repo name:** `poppet-t.github.io` (user/organization site — serves at `https://poppet-t.github.io/`, no subpath).
- **Branch:** `main`. GitHub Pages settings → source = `main` → root (`/`).
- **No CI needed.** Push to `main`, live in ~30 seconds.
- **Custom domain:** Not part of this scope. Can be added later via `CNAME` file.

## Non-goals (explicit scope limits)

- No hardware/shell render (buttons, hinge, speakers). The DS vibe comes from layout + palette + fonts.
- No per-section sub-routes. One page, hash-based sections only.
- No CMS / writeup engine. If a blog is added later, Astro migration is the path (decided earlier).
- No chiptune audio / sound effects (not ruled out forever, but not in this scope — can distract from readability).
- No analytics, no cookies, no third-party trackers.

## Assets — finalized

- **Pixel avatar (`fishing.gif`)** — source is `fishing.png` in the repo root, a 3-panel storyboard (cast → fish-on-hook → catch). Implementation steps:
  1. Split the source PNG into 3 equal-width frames.
  2. Remove the black panel-divider borders.
  3. Remove the background (sky / sea / rocks) so the character is isolated on a transparent layer. Use `rembg` (Python, `u2net` model) — good on pixel-art characters.
  4. Re-encode as a looping GIF with ~500ms per frame (feels like a natural fishing cadence — adjust during testing).
  5. Embed at 72×72 rendered size, `image-rendering: pixelated` in CSS.
- **Favicon** — use the existing `favicon_io/` folder (servo skull artwork). Copy its contents to the repo root and wire up via:
  ```html
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  ```
- **ORD date — confirmed:** 2028-04-06. Hardcode as a JS constant in `main.js`.
