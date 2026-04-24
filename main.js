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
