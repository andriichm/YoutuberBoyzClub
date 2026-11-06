// ===== Данные сайта: редактируйте здесь =====

// Участники клуба.
const MEMBERS = [
  {
    name: "Нокси",
    handle: "@Noksik_2011",
    role: "Ютубер · Roblox",
    channel: "https://www.youtube.com/@Noksik_2011",
    avatar: "img/noksik.jpg",
  },
  {
    name: "Rumzik",
    handle: "@Rumzik906",
    role: "Ютубер · Roblox",
    channel: "https://www.youtube.com/@Rumzik906",
    avatar: "img/rumzik.jpg",
  },
];

// Самые популярные видео (по просмотрам на 6 ноября 2026).
// id — часть ссылки после "shorts/" или "watch?v=". views — просто подпись.
const VIDEOS = [
  { id: "-DcFQy0u96M", author: "Нокси",  views: "311 тыс.", title: "СЕКРЕТНАЯ КОМНАТА В УКРАДИ ЯЙЦО 😱🥚" },
  { id: "tky6SiBI0Z0", author: "Rumzik", views: "32 тыс.",  title: "КАКОЙ ПИТОМЕЦ У ВАС В УКРАДИ ЯЙЦО?" },
  { id: "Lfz6eEAmaZ4", author: "Нокси",  views: "33 тыс.",  title: "Кто-то УКРАЛ у меня яйцо в Steal an Egg 😓" },
  { id: "n7U-Lp2LDsc", author: "Rumzik", views: "32 тыс.",  title: "ПОДПИСУЙТЕСЬ, ЕСЛИ ХОТИТЕ ЕГО!" },
  { id: "B-36ujy-UvE", author: "Нокси",  views: "31 тыс.",  title: "🥚 ЭТО САМОЕ МАЛЕНЬКОЕ ЯЙЦО В ROBLOX 💀😂" },
  { id: "7dOLobTop5Y", author: "Rumzik", views: "29 тыс.",  title: "ОЧЕНЬ ДОБРЫЙ ДРУГ В УКРАДИ ЯЙЦО" },
  { id: "PE_TCDWfL90", author: "Нокси",  views: "30 тыс.",  title: "У меня украли Брейнрота!!! 😭" },
  { id: "ghd9rPomUOI", author: "Rumzik", views: "29 тыс.",  title: "НАГЛЫЙ ДРУГ В УКРАДИ ЯЙЦО 😦" },
];

// Бегущая строка.
const TICKER = ["ROBLOX", "УКРАДИ ЯЙЦО", "МЕМЫ", "ШОРТСЫ", "ЧЕЛЛЕНДЖИ", "БРЕЙНРОТ", "КОЛЛАБЫ"];

// Дополнительные ссылки в подвале (каналы участников добавляются сами; пустые не показываются).
const SOCIALS = {
  telegram: "",
  discord: "",
  tiktok: "",
};

// Звук тика у счётчиков. Варианты: coin, odometer, xylo, bubble, laser, wheel, scanner, drop
// (послушать все можно на странице ticks.html).
const TICK_SOUND = "coin";
