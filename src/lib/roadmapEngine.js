import { getMastery } from "./mastery";

const MAX_WEEKS = 12;

const WEEK_TIPS = [
  "İlk hafta en önemlisi — düzenli çalışma alışkanlığı kur!",
  "Tempoyu koru! Her gün küçük adımlar büyük fark yaratır.",
  "Zayıf konuları atlama, onlar seni sınavda yakalar.",
  "Yarı yoldasın! Geri kalan her hafta seni hedefe yaklaştırır.",
  "Deneme çözerek eksiklerini tespit et, plana geri dön.",
  "Tekrar haftası — daha önce çözdüklerini pekiştir.",
  "Son viraj! Panik yapma, plana güven.",
  "Artık yeni konu yerine tekrar ve denemeye odaklan.",
];

const MILESTONES = [
  { at: 0.25, label: "Temel Atıldı", icon: "flag", tip: "İlk çeyreği tamamladın! Temeller sağlam." },
  { at: 0.50, label: "Yarı Yol", icon: "target", tip: "Yarıyı geçtin! Artık denemelerle pekiştir." },
  { at: 0.75, label: "Son Çeyrek", icon: "zap", tip: "Bitiş çizgisi görünüyor. Tam gaz!" },
  { at: 1.00, label: "Tamamlandı", icon: "checkCircle", tip: "Tüm konuları tamamladın!" },
];

export function buildRoadmap({ pool = [], progressByKey = {}, weakAreas = {}, daysLeft = null }) {
  const weeksLeft = daysLeft != null
    ? Math.max(1, Math.min(MAX_WEEKS, Math.ceil(daysLeft / 7)))
    : MAX_WEEKS;

  const remaining = [];
  const improving = [];
  let masteredCount = 0;
  let totalCount = 0;

  const ordered = [...pool].sort((a, b) => (weakAreas[a.key] ?? 60) - (weakAreas[b.key] ?? 60));

  ordered.forEach((subject) => {
    const prog = progressByKey[subject.key] || {};
    (subject.topics || []).forEach((t) => {
      const name = typeof t === "string" ? t : t.name;
      totalCount += 1;
      const tp = prog[name];
      const q = tp?.total_questions || 0;
      const acc = q > 0 ? Math.round(((tp.correct_count || 0) / q) * 100) : 0;
      const mastery = getMastery({ q, acc });
      const entry = {
        subject: subject.key,
        subjectLabel: subject.label,
        color: subject.color,
        topic: name,
        mastery: mastery.level,
        masteryLabel: mastery.label,
        masteryColorKey: mastery.colorKey,
        acc,
        q,
      };
      if (mastery.level === "mastered") {
        masteredCount += 1;
        return;
      }
      if (mastery.level === "improving") {
        improving.push(entry);
      } else {
        remaining.push(entry);
      }
    });
  });

  const allPending = [...improving, ...remaining];
  const perWeek = Math.max(1, Math.ceil(allPending.length / weeksLeft));
  const weeks = [];
  for (let w = 0; w < weeksLeft; w++) {
    const slice = allPending.slice(w * perWeek, (w + 1) * perWeek);
    if (!slice.length && w > 0) break;

    const subjectCounts = {};
    slice.forEach((t) => {
      subjectCounts[t.subjectLabel] = (subjectCounts[t.subjectLabel] || 0) + 1;
    });
    const focus = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    weeks.push({
      weekNo: w + 1,
      isCurrent: w === 0,
      topics: slice,
      focusSubjects: focus,
      tip: WEEK_TIPS[w % WEEK_TIPS.length],
    });
  }

  const progress = totalCount > 0 ? masteredCount / totalCount : 0;
  const activeMilestones = MILESTONES.filter((m) => progress >= m.at);
  const nextMilestone = MILESTONES.find((m) => progress < m.at) || null;

  return {
    weeksLeft,
    totalCount,
    masteredCount,
    improvingCount: improving.length,
    remainingCount: remaining.length,
    progress,
    weeks,
    milestones: activeMilestones,
    nextMilestone,
  };
}
