const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Участники
$("#members-grid").innerHTML = MEMBERS.map((m) => `
  <article class="member">
    ${m.avatar
      ? `<img class="avatar" src="${esc(m.avatar)}" alt="${esc(m.name)}">`
      : `<div class="avatar">${esc(m.name.trim()[0] || "?")}</div>`}
    <h3>${esc(m.name)}</h3>
    <p class="role">${esc(m.role)}</p>
    <span class="tag">${esc(m.tag)}</span><br>
    <a class="btn small" href="${esc(m.channel)}" target="_blank" rel="noopener">▶ Канал</a>
  </article>`).join("");

// Видео
$("#videos-grid").innerHTML = VIDEOS.map((v) => `
  <article class="video">
    <div class="frame">
      ${v.id
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}" title="${esc(v.title)}" loading="lazy" allowfullscreen
             allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
        : `<div class="placeholder"><div>Скоро здесь будет видео</div></div>`}
    </div>
    <h3>${esc(v.title)}</h3>
  </article>`).join("");

// Соцсети
const names = { youtube: "YouTube", telegram: "Telegram", discord: "Discord", tiktok: "TikTok" };
$("#socials").innerHTML = [
  ...MEMBERS.map((m) => [m.tag, m.channel]),
  ...Object.entries(SOCIALS).map(([k, url]) => [names[k] || k, url]),
]
  .filter(([, url]) => url)
  .map(([label, url]) => `<a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`)
  .join("");

// Счётчики
function countUp(el, target) {
  let n = 0;
  const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 60); };
  if (target > 0) step();
}
countUp($("#stat-members"), MEMBERS.length);
countUp($("#stat-videos"), VIDEOS.length);

$("#year").textContent = new Date().getFullYear();

// Мобильное меню
const burger = $(".burger"), links = $(".links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
