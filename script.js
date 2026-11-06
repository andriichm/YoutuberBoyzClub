const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const viewsNum = (v) => parseFloat(String(v).replace(",", ".")) || 0;

// ===== Заголовок: буквы падают по одной =====
(() => {
  const t = $("#title");
  let i = 0;
  const wrap = (text) => [...text].map((c) => c === " " ? " " : `<span class="ch" style="animation-delay:${(i++) * 0.04}s">${esc(c)}</span>`).join("");
  t.innerHTML = [...t.childNodes].map((n) => n.nodeType === 3 ? wrap(n.textContent) : `<b>${wrap(n.textContent)}</b>`).join("");
})();

// ===== Живой фон: кнопки play летят и крутятся при прокрутке =====
const bgIcons = [];
(() => {
  const box = $("#bg");
  const colors = ["#ff0000", "#ffffff", "#ffd21f", "#ff0000"];
  const count = innerWidth < 720 ? 14 : 26;
  for (let k = 0; k < count; k++) {
    const depth = Math.random();                 // 0 — далеко, 1 — близко
    const s = 18 + depth * 70;                   // ближние больше
    const el = document.createElement("div");
    el.className = "ic" + (k % 3 === 0 ? " line" : "");
    const c = colors[k % colors.length];
    el.style.cssText = `--s:${s}px;--c:${c};--o:${.08 + depth * .22};--tri:${k % 3 === 0 ? c : "#0f0f0f"};--d:${4 + Math.random() * 5}s`;
    el.innerHTML = "<b></b>";
    box.appendChild(el);
    bgIcons.push({
      el, x: Math.random() * 100, y: Math.random(),
      speed: .15 + depth * .9,                   // ближние летят быстрее (параллакс)
      spin: (Math.random() - .5) * .6,
      sway: 20 + Math.random() * 60, phase: Math.random() * 6.28,
    });
  }
})();
const blobs = document.querySelectorAll(".blob");
const rows = document.querySelectorAll(".bigtext .row");

let lastY = -1;
function frame() {
  const y = scrollY;
  if (y !== lastY) {
    lastY = y;
    const vh = innerHeight + 160;
    for (const p of bgIcons) {
      const ty = ((p.y * vh - y * p.speed) % vh + vh) % vh - 80;
      const tx = Math.sin(y / 300 + p.phase) * p.sway;
      p.el.style.transform = `translate(calc(${p.x}vw + ${tx}px), ${ty}px) rotate(${y * p.spin}deg)`;
    }
    blobs[0].style.transform = `translate(${Math.sin(y / 600) * 15}vw, ${y * .15 % innerHeight}px)`;
    blobs[1].style.transform = `translate(${Math.cos(y / 500) * -12}vw, ${-y * .1 % innerHeight}px)`;
    rows.forEach((r) => {
      const rect = r.getBoundingClientRect();
      const off = (rect.top - innerHeight / 2) * .6 * Number(r.dataset.dir);
      r.style.transform = `translateX(${off - 200}px)`;
    });
    const h = document.documentElement;
    $("#progress").style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + "%";
  }
  requestAnimationFrame(frame);
}
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(frame);

// ===== Бегущая строка (дублируем для бесконечной прокрутки) =====
$("#ticker").innerHTML = [...TICKER, ...TICKER, ...TICKER, ...TICKER].map((w) => `<span>${esc(w)}</span>`).join("");

// ===== Участники =====
$("#members-grid").innerHTML = MEMBERS.map((m) => {
  const n = VIDEOS.filter((v) => v.author === m.name).length;
  return `
  <article class="member reveal">
    <div class="avatar-wrap">
      ${m.avatar
        ? `<img class="avatar" src="${esc(m.avatar)}" alt="${esc(m.name)}">`
        : `<div class="avatar">${esc(m.name.trim()[0] || "?")}</div>`}
    </div>
    <h3>${esc(m.name)}</h3>
    <div class="handle">${esc(m.handle)}</div>
    <span class="role">${esc(m.role)}</span>
    <span class="count">${n} видео в топе клуба</span>
    <a class="btn" href="${esc(m.channel)}" target="_blank" rel="noopener">▶ Смотреть канал</a>
  </article>`;
}).join("");

// ===== Видео =====
const sorted = [...VIDEOS].sort((a, b) => viewsNum(b.views) - viewsNum(a.views));
$("#videos-grid").innerHTML = sorted.map((v, idx) => `
  <article class="video reveal" data-author="${esc(v.author)}" style="transition-delay:${(idx % 4) * 0.08}s">
    <span class="badge ${idx === 0 ? "hot" : ""}">${idx === 0 ? "🔥 ХИТ · " : "👁 "}${esc(v.views)}</span>
    <div class="frame" data-id="${esc(v.id)}" role="button" tabindex="0" aria-label="Смотреть: ${esc(v.title)}">
      <img src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/oar2.jpg" alt="" loading="lazy"
           onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg'">
      <span class="pbtn"></span>
    </div>
    <div class="vmeta">
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.author)} · ${esc(v.views)} просмотров</p>
    </div>
  </article>`).join("");

// Клик по превью — запускаем видео прямо на сайте
function playFrame(f) {
  if (f.querySelector("iframe")) return;
  f.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(f.dataset.id)}?autoplay=1&rel=0"
    allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube"></iframe>`;
}
$("#videos-grid").addEventListener("click", (e) => { const f = e.target.closest(".frame"); if (f) playFrame(f); });
$("#videos-grid").addEventListener("keydown", (e) => {
  const f = e.target.closest(".frame");
  if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); playFrame(f); }
});

// Фильтры по автору
const authors = ["Все", ...MEMBERS.map((m) => m.name)];
$("#filters").innerHTML = authors.map((a, i) => `<button class="chip ${i ? "" : "active"}" data-a="${esc(a)}">${esc(a)}</button>`).join("");
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest(".chip"); if (!b) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
  document.querySelectorAll(".video").forEach((v) => v.classList.toggle("hide", b.dataset.a !== "Все" && v.dataset.author !== b.dataset.a));
});

// ===== Соцсети в подвале =====
const names = { telegram: "Telegram", discord: "Discord", tiktok: "TikTok" };
$("#socials").innerHTML = [
  ...MEMBERS.map((m) => ["▶ " + m.handle, m.channel]),
  ...Object.entries(SOCIALS).map(([k, url]) => [names[k] || k, url]),
]
  .filter(([, url]) => url)
  .map(([label, url]) => `<a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`)
  .join("");

$("#year").textContent = new Date().getFullYear();

// ===== Счётчики =====
const totals = {
  MEMBERS: MEMBERS.length,
  VIDEOS: VIDEOS.length,
  VIEWS: Math.round(VIDEOS.reduce((s, v) => s + viewsNum(v.views), 0)),
};
function countUp(el, target) {
  const start = performance.now(), dur = 1400;
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
setTimeout(() => document.querySelectorAll("[data-count]").forEach((el) => countUp(el, totals[el.dataset.count] || 0)), 600);

// ===== Появление блоков при прокрутке =====
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));


// ===== Мобильное меню =====
const burger = $(".burger"), links = $(".links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
