// ===== Варианты звука тика для счётчиков =====
// Каждый вариант получает: tone(частота, длительность, тип, громкость, скользить_до, задержка),
// noise(длительность, громкость, фильтр_от, фильтр_до, задержка) и p — прогресс от 0 до 1.
// Какой вариант играет на сайте — задаётся в data.js (TICK_SOUND).

const PENTA_TICK = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093];

const TICKS = {
  coin: {
    name: "Монетка",
    desc: "8-бит, поднимается выше с ростом числа",
    play: (tone, noise, p) => { const f = 420 + p * 1400; tone(f, .06, "square", .1); tone(f * 1.5, .04, "triangle", .07); },
  },
  odometer: {
    name: "Механический счётчик",
    desc: "Сухой щелчок, как у старых цифр-барабанов",
    play: (tone, noise, p) => { noise(.025, .35, 7000, 1500); tone(180, .03, "square", .08, 90); },
  },
  xylo: {
    name: "Ксилофон",
    desc: "Мелодия бежит вверх по нотам",
    play: (tone, noise, p) => { const f = PENTA_TICK[Math.min(PENTA_TICK.length - 1, Math.floor(p * PENTA_TICK.length))]; tone(f, .14, "sine", .16); tone(f * 2, .06, "sine", .05); },
  },
  bubble: {
    name: "Пузырьки",
    desc: "Мягкое «буль-буль»",
    play: (tone, noise, p) => { const f = 300 + p * 500; tone(f, .07, "sine", .22, f * 2.4); },
  },
  laser: {
    name: "Лазер «пиу»",
    desc: "Как выстрелы в аркаде",
    play: (tone, noise, p) => { const f = 1600 + p * 800; tone(f, .07, "square", .07, f / 4); },
  },
  wheel: {
    name: "Колесо удачи",
    desc: "Пластиковое «тр-р-р», как у барабана с призами",
    play: (tone, noise, p) => { noise(.03, .3, 3500, 800); tone(900 + p * 300, .025, "triangle", .08); },
  },
  scanner: {
    name: "Сканер на кассе",
    desc: "Короткие одинаковые «бип»",
    play: (tone, noise, p) => tone(1900, .04, "sine", .12),
  },
  drop: {
    name: "Капли воды",
    desc: "Звонкие капли «плюм»",
    play: (tone, noise, p) => { const f = 1400 + Math.random() * 900; tone(f, .09, "sine", .18, f / 3); },
  },
};
