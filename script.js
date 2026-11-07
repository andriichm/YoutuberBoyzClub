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
function countUp(el, target, withSound) {
  const start = performance.now(), dur = 3200;
  let shown = -1;
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 2)));
    if (v !== shown) {
      shown = v;
      el.textContent = v;
      if (withSound && p < 1) Sound.play("tick", v / target);   // тиканье, всё выше и выше
    }
    if (p < 1) requestAnimationFrame(tick);
    else if (withSound) { Sound.play("done"); el.classList.add("bump"); }
  };
  requestAnimationFrame(tick);
}
function startCounters() {
  // Звучит самый большой счётчик (просмотры), чтобы тики не накладывались
  setTimeout(() => document.querySelectorAll("[data-count]").forEach((el) =>
    countUp(el, totals[el.dataset.count] || 0, el.dataset.count === "VIEWS")), 500);
}

// ===== Появление блоков при прокрутке =====
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));


// ===== Звуки кнопок (по умолчанию выключены) =====
const Sound = (() => {
  let on = false, ctx = null;
  on = true;                                                     // по умолчанию звук включён
  try { if (localStorage.getItem("ybc-sound") === "0") on = false; } catch (e) {}
  const btn = $("#sound");
  const paint = () => {
    btn.textContent = on ? "🔊" : "🔇";
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on);
    btn.setAttribute("aria-label", on ? "Выключить звук" : "Включить звук");
  };
  const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());

  // Короткий тон с быстрым затуханием
  function tone(freq, dur, type = "square", vol = .08, slideTo = null, delay = 0) {
    const a = ac(), t = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + .02);
  }
  // Шум (для «пыха» и взрыва)
  function noise(dur, vol = .2, from = 4000, to = 200, delay = 0) {
    const a = ac(), t = a.currentTime + delay;
    const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "lowpass";
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }
  // Пентатоника — любые ноты из неё звучат вместе красиво
  const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319];
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const sounds = {
    // обычный щелчок: «блип» каждый раз чуть другой высоты
    click: () => { const f = rnd(PENTA); tone(f, .06, "square", .045, f * .6); noise(.02, .05, 6000, 2000); },
    // большая кнопка play: «буль» + звёздное арпеджио вверх
    pop: () => {
      tone(180, .15, "sine", .35, 900);
      [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, .12, "triangle", .07, null, .08 + i * .055));
    },
    // запуск видео: ретро «монетка»
    play: () => { tone(988, .08, "square", .07); tone(1319, .25, "square", .07, null, .08); },
    // фильтры: ксилофон
    chip: () => { const f = rnd(PENTA); tone(f, .18, "sine", .12); tone(f * 2, .08, "sine", .04); },
    // наведение на карточку: еле слышный «тинь»
    hover: () => tone(rnd(PENTA) * 2, .09, "sine", .025),
    // звук включён: мажорное «та-да»
    on: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, "triangle", .1, null, i * .07)),
    // экран загрузки: «бум» + искры
    boom: () => {
      noise(.6, .35, 3000, 80);
      tone(120, .45, "sine", .4, 40);
      [1568, 2093, 2637].forEach((f, i) => tone(f, .1, "triangle", .04, null, .1 + i * .07));
    },
  };
  // рост чисел: тик, который поднимается по высоте вместе с числом (p — от 0 до 1)
  // вариант тика выбирается в data.js (TICK_SOUND), сами варианты — в ticks.js
  // "random" — при каждом заходе случайный из 8 вариантов (один на весь подсчёт)
  const tickKey = (() => {
    const want = typeof TICK_SOUND !== "undefined" ? TICK_SOUND : "random";
    if (typeof TICKS === "undefined") return null;
    if (want !== "random" && TICKS[want]) return want;
    let prev = null;
    try { prev = localStorage.getItem("ybc-tick"); } catch (e) {}
    const keys = Object.keys(TICKS).filter((k) => k !== prev);   // не повторяем прошлый раз
    const pick = keys[Math.floor(Math.random() * keys.length)];
    try { localStorage.setItem("ybc-tick", pick); } catch (e) {}
    return pick;
  })();
  sounds.tick = (p) => {
    const t = tickKey ? TICKS[tickKey] : null;
    if (t) t.play(tone, noise, p);
    else { const f = 420 + p * 1400; tone(f, .06, "square", .1); tone(f * 1.5, .04, "triangle", .07); }
  };
  // число досчиталось: громкое «динь-динь-ДИНЬ»
  sounds.done = () => {
    [1319, 1568, 2093].forEach((f, i) => tone(f, .3, "triangle", .14, null, i * .09));
    tone(2637, .5, "sine", .08, null, .27);
  };

  // фанфары: «та-та-та-ТААА» медью (пила + квадрат)
  sounds.fanfare = () => {
    const brass = (f, d, dl, v = .07) => { tone(f, d, "sawtooth", v, null, dl); tone(f * 2, d, "square", v * .3, null, dl); };
    brass(392, .14, 0); brass(392, .14, .16); brass(392, .14, .32);
    brass(523, .5, .48, .09);
    brass(466, .14, 1.0); brass(523, .14, 1.16);
    [523, 659, 784, 1047].forEach((f) => brass(f, 1.1, 1.32, .05));     // финальный аккорд
    [2093, 2637, 3136].forEach((f, i) => tone(f, .2, "triangle", .04, null, 1.4 + i * .1));
  };
  // режим хаоса: 10 секунд бита — бочка, хэт и безумные «блипы»
  sounds.chaos = () => {
    const a = ac();
    for (let i = 0; i < 40; i++) {
      const t = i * .25;
      if (i % 2 === 0) tone(150, .18, "sine", .35, 40, t);                    // бочка
      noise(.04, .12, 9000, 5000, t + .125);                                   // хэт
      if (i % 4 === 3) noise(.12, .2, 2500, 400, t);                           // хлопок
      const f = rnd(PENTA) * (Math.random() < .5 ? 1 : 2);
      tone(f, .1, Math.random() < .5 ? "square" : "sawtooth", .04, Math.random() < .3 ? f * 3 : null, t + .06);
    }
    tone(200, .6, "sawtooth", .08, 1600, 0);                                   // сирена на старте
  };
  // мини-звук комбо (каждое нажатие на большую кнопку выше)
  sounds.combo = (n) => tone(300 + n * 90, .08, "square", .08, (300 + n * 90) * 1.5);

  let lastHover = 0, lastTick = 0;
  function play(name, arg) {
    if (!on) return;
    const n = performance.now();
    if (name === "hover") { if (n - lastHover < 120) return; lastHover = n; }
    if (name === "tick") { if (n - lastTick < 60) return; lastTick = n; }
    try { const a = ac(); if (a.state === "suspended") a.resume(); sounds[name](arg); } catch (e) {}
  }
  document.addEventListener("mouseover", (e) => {
    const c = e.target.closest(".tilt");
    if (c && !c.contains(e.relatedTarget)) play("hover");
  });

  btn.addEventListener("click", () => {
    on = !on;
    try { localStorage.setItem("ybc-sound", on ? "1" : "0"); } catch (e) {}
    paint();
    if (on) { ac().resume(); play("on"); }
  });
  paint();

  // Какой звук для какого элемента
  document.addEventListener("click", (e) => {
    if (e.target.closest("#sound")) return;
    if (e.target.closest(".play-big")) return;          // у большой кнопки свои звуки (комбо)
    else if (e.target.closest(".frame")) play("play");
    else if (e.target.closest(".chip")) play("chip");
    else if (e.target.closest("a, button")) play("click");
  });
  return { play, tickKey };
})();

// ===== ПАСХАЛКА 1: 10 нажатий на большую кнопку play → конфетти и фанфары =====
(() => {
  const big = $(".play-big");
  const combo = document.createElement("b");     // не span — иначе подхватит стили самой кнопки
  combo.className = "combo";
  big.appendChild(combo);
  let count = 0, timer = null;

  big.addEventListener("click", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    count++;
    if (count >= 10) {
      count = 0;
      combo.textContent = "🎉";
      combo.classList.remove("pop"); void combo.offsetWidth; combo.classList.add("pop");
      confetti();
      Sound.play("fanfare");
      return;
    }
    Sound.play(count === 1 ? "pop" : "combo", count);
    if (count > 1) {
      combo.textContent = "x" + count;
      combo.classList.remove("pop"); void combo.offsetWidth; combo.classList.add("pop");
    }
    // если перестали жать — едем к видео, как обычно
    timer = setTimeout(() => {
      count = 0;
      $("#videos").scrollIntoView({ behavior: "smooth" });
    }, 650);
  });

  function confetti() {
    const colors = ["#ff0000", "#ffffff", "#ffd21f", "#ff0000", "#ff7a7a"];
    const n = innerWidth < 720 ? 90 : 170;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      const type = i % 5;                           // 0 — кнопка play, остальные — бумажки
      c.className = "confetti" + (type === 0 ? " yt" : "");
      const size = type === 0 ? 18 + Math.random() * 14 : 7 + Math.random() * 9;
      c.style.cssText = `left:${Math.random() * 100}vw;--w:${size}px;--h:${type === 0 ? size * .7 : size * (.4 + Math.random())}px;` +
        `--c:${colors[i % colors.length]};--sway:${(Math.random() - .5) * 220}px;--rot:${(Math.random() - .5) * 1440}deg;` +
        `animation-duration:${2.6 + Math.random() * 2.2}s;animation-delay:${Math.random() * 1.2}s`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 6200);
    }
  }
})();

// ===== ПАСХАЛКА 2: набрать BOYZ → режим хаоса на 10 секунд =====
(() => {
  const code = ["KeyB", "KeyO", "KeyY", "KeyZ"];   // по физическим клавишам — работает и на русской раскладке
  let pos = 0, active = false;
  addEventListener("keydown", (e) => {
    if (document.body.classList.contains("loading") || active) return;
    if (e.code === code[pos]) {
      pos++;
      if (pos === code.length) { pos = 0; chaos(); }
    } else pos = e.code === code[0] ? 1 : 0;
  });

  function chaos() {
    active = true;
    const html = document.documentElement;
    html.classList.add("chaos");
    // разные задержки, чтобы всё трясло вразнобой
    document.querySelectorAll(".title .ch, .member, .video, .features article, .stats div").forEach((el) => {
      el.style.setProperty("--cd", (Math.random() * -.6).toFixed(2) + "s");
    });
    const toast = document.createElement("div");
    toast.className = "chaos-toast";
    document.body.appendChild(toast);
    Sound.play("chaos");
    let left = 10;
    const tick = () => {
      toast.textContent = `😈 РЕЖИМ ХАОСА · ${left}`;
      if (left-- <= 0) {
        html.classList.remove("chaos");
        toast.classList.add("bye");
        setTimeout(() => toast.remove(), 400);
        active = false;
        return;
      }
      setTimeout(tick, 1000);
    };
    tick();
  }
})();

// ===== 3D-наклон карточек за мышкой =====
if (matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".video, .member, .features article").forEach((card) => {
    card.classList.add("tilt");
    const glare = document.createElement("div");
    glare.className = "glare";
    card.appendChild(glare);
    const max = card.classList.contains("video") ? 14 : 10;   // градусов
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.classList.add("tilting");
      card.style.transform = `perspective(800px) rotateX(${(.5 - py) * max * 2}deg) rotateY(${(px - .5) * max * 2}deg) scale(1.04)`;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("tilting");
      card.style.transform = "";
    });
  });
}

// ===== Экран загрузки: кнопка заполняется красным и разлетается =====
(() => {
  const loader = $("#loader"), btn = $("#lbtn"), fill = $("#lfill"), pct = $("#lpct");
  const start = performance.now(), dur = 1300;
  let pageLoaded = document.readyState === "complete";
  addEventListener("load", () => { pageLoaded = true; });

  function step(now) {
    if (isReady) return;
    let p = Math.min((now - start) / dur, 1);
    if (!pageLoaded && p > .9) p = .9 + (p - .9) * .1;       // ждём, пока страница реально загрузится
    if (now - start > 4000) pageLoaded = true;                // но не дольше 4 секунд
    const eased = 1 - Math.pow(1 - p, 2);
    fill.style.width = eased * 100 + "%";
    pct.textContent = Math.round(eased * 100) + "%";
    if (p < 1 || !pageLoaded) requestAnimationFrame(step);
    else ready();
  }

  // Заполнилось → ждём нажатия (нажатие нужно браузеру, чтобы разрешить звук)
  let isReady = false;
  function ready() {
    if (isReady) return;
    isReady = true;
    fill.style.width = "100%";
    pct.textContent = "PRESS PLAY ▶";
    pct.classList.add("ready");
    btn.classList.add("full", "ready");
    loader.classList.add("ready");
    // click/keydown — события, которые браузер точно считает «разрешением на звук» (и на телефоне тоже)
    const go = (e) => {
      if (e.type === "keydown" && (e.key === "Tab" || e.key === "Escape")) return;
      loader.removeEventListener("click", go);
      removeEventListener("keydown", go);
      explode();
    };
    loader.addEventListener("click", go);
    addEventListener("keydown", go);
  }

  let exploded = false, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    loader.classList.add("done");
    document.body.classList.remove("loading");
    startCounters();
    setTimeout(() => loader.remove(), 600);
  }
  // Страховка: если анимации заморожены (фоновая вкладка), всё равно показываем «НАЖМИ ▶»
  setTimeout(ready, 4500);

  function explode() {
    if (exploded) return;
    exploded = true;
    btn.classList.remove("ready");
    loader.classList.remove("ready");
    Sound.play("pop");
    setTimeout(() => {
      loader.classList.add("exploding");
      btn.classList.add("boom");
      Sound.play("boom");
      const flash = document.createElement("div"); flash.className = "flash"; document.body.appendChild(flash);
      const colors = ["#ff0000", "#ff0000", "#ffffff", "#ffd21f"];
      for (let i = 0; i < 34; i++) {
        const s = document.createElement("div");
        const a = Math.random() * Math.PI * 2, d = 160 + Math.random() * Math.max(innerWidth, innerHeight) * .55;
        const size = 8 + Math.random() * 26;
        s.className = "shard";
        s.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;--rot:${(Math.random() - .5) * 720}deg;` +
          `--w:${size}px;--h:${size * (.5 + Math.random() * .6)}px;--c:${colors[i % 4]};--r:${i % 3 ? "30% / 40%" : "50%"};` +
          `animation-delay:${Math.random() * .06}s`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1100);
      }
      setTimeout(() => flash.remove(), 600);
      setTimeout(finish, 280);
    }, 120);
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
  } else requestAnimationFrame(step);
})();

// ===== Мобильное меню =====
const burger = $(".burger"), links = $(".links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
