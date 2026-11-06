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

// ===== Летающие кнопки play на фоне =====
(() => {
  const box = $("#floaters");
  const colors = ["#ff0000", "#ffffff", "#ffd21f"];
  for (let k = 0; k < 16; k++) {
    const i = document.createElement("i");
    i.style.cssText = `left:${Math.random() * 100}%;--s:${20 + Math.random() * 50}px;--c:${colors[k % 3]};` +
      `--d:${12 + Math.random() * 14}s;--delay:${-Math.random() * 20}s;--rot:${(Math.random() - .5) * 120}deg`;
    box.appendChild(i);
  }
})();

// ===== Бегущая строка (дублируем для бесконечной прокрутки) =====
$("#ticker").innerHTML = [...TICKER, ...TICKER, ...TICKER, ...TICKER].map((w) => `<span>${esc(w)}</span>`).join("");

// ===== Участники =====
$("#members-grid").innerHTML = MEMBERS.map((m) => {
  const n = VIDEOS.filter((v) => v.author === m.name).length;
  return `
  <article class="member reveal">
    <div class="avatar-wrap">
      ${m.avatar
        ? `<img class="avatar" src="${esc(m.avatar)}" alt="${esc(m.name)}" referrerpolicy="no-referrer">`
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

// ===== Полоска прогресса прокрутки =====
addEventListener("scroll", () => {
  const h = document.documentElement;
  $("#progress").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
}, { passive: true });

// ===== Мобильное меню =====
const burger = $(".burger"), links = $(".links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
