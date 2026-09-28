// "Ana ekranina ekle" rehberinin metni. Adimlar iOS 17-18 menu adlariyla.

export const HOME_STEPS = [
  "Ana ekranda boş bir yere basılı tut.",
  "Sol üstteki Düzenle'ye, sonra Araç Takımı Ekle'ye dokun.",
  "Maraton'u ara, bir widget seç ve Araç Takımını Ekle'ye bas.",
];

export const LOCK_STEPS = [
  "Kilit ekranına basılı tut, Özelleştir'e dokun.",
  "Kilit Ekranı'nı seç, saatin altındaki alana dokun.",
  "Maraton'dan Sınava kalan gün ya da Sıradaki iş'i ekle.",
];

export const WIDGETS = [
  { key: "today", name: "Bugün", line: "Günün işleri, sıradaki durak ve süresi.", lock: true },
  { key: "week", name: "Bu hafta", line: "Günlük çubuklar ve hedef çizgisi." },
  { key: "route", name: "Rota", line: "Sınava kalan gün ve net çizgin.", lock: true },
  { key: "trial", name: "Deneme", line: "Son denemelerin ve ders ders değişim." },
  { key: "streak", name: "Seri", line: "Son dört haftanın çalışma ızgarası." },
  { key: "review", name: "Tekrar", line: "Tekrarı gelen yanlış soruların.", lock: true },
];
