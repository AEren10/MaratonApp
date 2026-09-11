// ARAMA — konu ve yanlis defteri uzerinde yerel arama.
//
// Tasarim (AKIS 7 · "Arama") iki bolum gosteriyor: KONULAR ve
// DEFTERDEKI YANLISLAR. Topluluk sonuclari YAZILMAZ (v1 kapsami disi).
//
// Arama sunucuya gitmez: konu listesi zaten mufredattan yerel, yanlislar
// da ekran acilirken bir kez cekiliyor. Boylece her tusa basista istek
// atilmiyor ve cevrimdisiyken de calisiyor.

/** Turkce'ye duyarli normalizasyon: "İNTEGRAL" ve "integral" eslesmeli. */
export function normalize(text) {
  return String(text ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[ıi̇]/g, "i")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c")
    .trim();
}

/**
 * Baslangic eslesmesi sonda gecen eslesmeden once gelir: "per" yazan
 * kullanici once "Permutasyon"u gormeli, "Hiperbol"u degil.
 */
function rank(haystack, needle) {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return -1;
  const at = h.indexOf(n);
  if (at < 0) return -1;
  return at === 0 ? 0 : 1;
}

export function searchTopics(subjects = [], query, limit = 8) {
  if (!normalize(query)) return [];
  const hits = [];
  for (const subject of subjects) {
    for (const topic of subject.topics || []) {
      const r = rank(topic, query);
      if (r < 0) continue;
      hits.push({ rank: r, topic, subjectKey: subject.key, subjectLabel: subject.label });
    }
  }
  return hits
    .sort((a, b) => a.rank - b.rank || a.topic.localeCompare(b.topic, "tr"))
    .slice(0, limit);
}

export function searchWrongQuestions(rows = [], query, limit = 8) {
  if (!normalize(query)) return [];
  return rows
    .map((row) => {
      // Not ve konu birlikte aranir; yalniz konuya bakmak "permutasyonda
      // tekrarli dizilis" gibi not metinlerini gorunmez yapardi.
      const r = Math.min(
        ...[rank(row.topic, query), rank(row.note, query)]
          .filter((v) => v >= 0)
          .concat([99]),
      );
      return r === 99 ? null : { rank: r, row };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((h) => h.row);
}

/**
 * "3 gun sonra" / "tekrar bugun" / "gecikti".
 * next_review_at yoksa null doner — tarih uydurulmaz.
 */
export function reviewDueLabel(nextReviewAt, now = new Date()) {
  if (!nextReviewAt) return null;
  const due = new Date(nextReviewAt);
  if (Number.isNaN(due.getTime())) return null;
  const days = Math.round((due.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000);
  if (days < 0) return { text: "gecikti", due: true };
  if (days === 0) return { text: "tekrar bugün", due: true };
  if (days === 1) return { text: "yarın", due: false };
  return { text: `${days} gün sonra`, due: false };
}

/** Tasarimin "İntegral olarak ara" onerisi: bas harfi buyuten duzeltme. */
export function suggestedQuery(query) {
  const trimmed = String(query ?? "").trim();
  const firstWord = trimmed.split(/\s+/)[0] || "";
  if (!firstWord || firstWord === trimmed) return null;
  return firstWord.charAt(0).toLocaleUpperCase("tr-TR") + firstWord.slice(1);
}
