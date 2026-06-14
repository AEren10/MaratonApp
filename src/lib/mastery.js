// Madde 5: Konu mastery (ustalaşma) seviyesi.
// Eşikler:
//   gri  (başlangıç): < 10 soru veya < %60 doğruluk
//   sarı (gelişiyor) : >= 10 soru ve %60-80 doğruluk
//   yeşil (ustalaştın): >= 20 soru ve > %80 doğruluk

const COLORS = {
  mastered: "#4ECE8E", // yeşil
  improving: "#EBAE63", // sarı/amber
  starter: "#686C7A", // gri (muted)
};

export function getMastery({ q = 0, acc = 0 } = {}) {
  if (q >= 20 && acc > 80) {
    return { level: "mastered", color: COLORS.mastered, label: "Ustalaştın" };
  }
  if (q >= 10 && acc >= 60) {
    return { level: "improving", color: COLORS.improving, label: "Gelişiyor" };
  }
  return { level: "starter", color: COLORS.starter, label: "Başlangıç" };
}

// Bir konu listesindeki "yeşillik" (ustalaşma) yüzdesi.
export function masteryPercent(topics = []) {
  if (!topics.length) return 0;
  const mastered = topics.filter((t) => getMastery({ q: t.q, acc: t.acc }).level === "mastered").length;
  return Math.round((mastered / topics.length) * 100);
}
