(() => {
  "use strict";

  const SECTIONS = ["about", "work", "research", "ctf", "blog", "contact"];
  const DEFAULT_SECTION = "about";

  const tiles = Array.from(document.querySelectorAll(".tile[data-section]"));
  const sections = Array.from(document.querySelectorAll(".section[data-section]"));

  function parseHash() {
    const raw = location.hash.replace(/^#/, "").trim();
    if (!raw) return { section: DEFAULT_SECTION, sub: "" };
    const [section, ...rest] = raw.split("/");
    const validSection = SECTIONS.includes(section) ? section : DEFAULT_SECTION;
    return { section: validSection, sub: rest.join("/") };
  }

  function sectionFromHash() {
    return parseHash().section;
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
    if (parseHash().section !== name) {
      history.replaceState(null, "", `#${name}`);
    }
    if (name === "blog") {
      renderBlog(parseHash().sub);
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

  // ---- Blog ----
  const BLOG_INDEX_URL = "/posts/index.json";
  const blogIndexEl = document.getElementById("blog-index");
  const blogPostEl = document.getElementById("blog-post");
  const blogPostContentEl = document.getElementById("blog-post-content");
  const blogBackBtn = document.getElementById("blog-back");

  let blogIndexCache = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  async function loadBlogIndex() {
    if (blogIndexCache) return blogIndexCache;
    try {
      const res = await fetch(BLOG_INDEX_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      blogIndexCache = await res.json();
      return blogIndexCache;
    } catch (err) {
      console.error("Failed to load blog index:", err);
      return null;
    }
  }

  function renderBlogIndex(posts) {
    if (!blogIndexEl) return;
    if (!posts || posts.length === 0) {
      blogIndexEl.innerHTML = `<p class="meta">No posts yet.</p>`;
      return;
    }
    const sorted = [...posts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    blogIndexEl.innerHTML = sorted.map((p) => `
      <a class="post-item" href="#blog/${encodeURIComponent(p.slug)}">
        <div class="post-title">${escapeHtml(p.title)}</div>
        <div class="post-meta">${escapeHtml(p.date || "")}</div>
        <p class="post-excerpt">${escapeHtml(p.excerpt || "")}</p>
      </a>
    `).join("");
  }

  async function renderBlogPost(slug) {
    if (!blogPostContentEl) return;
    blogPostContentEl.innerHTML = `<p class="meta">Loading…</p>`;
    try {
      const res = await fetch(`/posts/${encodeURIComponent(slug)}.md`, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      if (typeof marked === "undefined") {
        blogPostContentEl.innerHTML = `<pre>${escapeHtml(md)}</pre>`;
        return;
      }
      blogPostContentEl.innerHTML = marked.parse(md, { breaks: false, gfm: true });
    } catch (err) {
      console.error("Failed to load post:", err);
      blogPostContentEl.innerHTML = `<p class="meta">Post not found.</p>`;
    }
  }

  async function renderBlog(sub) {
    if (!blogIndexEl || !blogPostEl) return;
    if (!sub) {
      // index view
      blogPostEl.hidden = true;
      blogIndexEl.hidden = false;
      const posts = await loadBlogIndex();
      renderBlogIndex(posts);
    } else {
      // post view
      blogIndexEl.hidden = true;
      blogPostEl.hidden = false;
      renderBlogPost(sub);
    }
  }

  if (blogBackBtn) {
    blogBackBtn.addEventListener("click", () => {
      history.replaceState(null, "", "#blog");
      renderBlog("");
    });
  }
})();
