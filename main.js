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
