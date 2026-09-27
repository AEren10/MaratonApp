export function filterTopics(topics, segment) {
  if (segment === "done") return topics.filter((t) => t.done);
  if (segment === "remaining") return topics.filter((t) => !t.done);
  return topics;
}

// Mufredatta unite kavrami yok (useSubjectTopics: duz liste). Eskiden
// her dersin konulari sirasina gore "Sayilar ve Islemler / Cebir / Sayma
// ve Olasilik" basliklarina bolunuyor, sagdaki "defter 3", "planda",
// "bugun" etiketleri de siraya gore uyduruluyordu. Artik tek liste ve
// yalniz gercek durum: biten konu "tamam".
export function groupTopics(topics) {
  if (!topics || topics.length === 0) return [];
  const data = topics.map((t) => ({ ...t, statusLabel: t.done ? "tamam" : null }));
  return [{ title: "Konular", data }];
}
