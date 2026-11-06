// ===== Данные сайта: редактируйте здесь =====

// Участники клуба. channel — ссылка на YouTube-канал, avatar — ссылка на картинку (можно оставить пустой).
const MEMBERS = [
  { name: "Noksik", role: "Ютубер", tag: "@Noksik_2011", channel: "https://www.youtube.com/@Noksik_2011", avatar: "" },
  { name: "Rumzik", role: "Ютубер", tag: "@Rumzik906", channel: "https://www.youtube.com/@Rumzik906", avatar: "" },
];

// Видео. id — это часть ссылки после "watch?v=", например для
// https://www.youtube.com/watch?v=abc123XYZ id будет "abc123XYZ".
// Пока id пустой, показывается заглушка.
const VIDEOS = [
  { id: "", title: "Наше первое совместное видео" },
  { id: "", title: "Челлендж клуба" },
  { id: "", title: "Лучшие моменты стримов" },
];

// Дополнительные ссылки клуба в подвале (каналы участников добавляются сами; пустые не показываются).
const SOCIALS = {
  telegram: "",
  discord: "",
  tiktok: "",
};
