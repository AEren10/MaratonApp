// GUNLUK RUTIN -- her gun ayni tur calisma (paragraf, problem, kelime...).
//
// Ogrencilerin cogu bazi turleri her gun cozmek ister: paragraf ve problem
// gunluk refleks, bir haftada toplu cozulmez. Rutin rotanin disinda degil
// ICINDE: haftalik yuku rota butcesinden dusulur (ogrenci asiri yuklenmez),
// her calisma gunu listenin basina "isinma" olarak girer.
//
// Konu sabit degil: "Problem" rutini her gun en zayif / en az calisilan
// problem turunu secer (yas, hiz, yuzde...). Tamamlanma ayri tutulmaz:
// o gun havuzdaki konulardan hedef kadar soru cozulduyse rutin bitmistir.

export const HABIT_PRESETS = [
  {
    key: "paragraf", label: "Paragraf", subject: "turkce", subjectLabel: "Türkçe", questions: 20,
    pool: ["Paragraf (Ana Düşünce)", "Paragraf (Yardımcı Düşünce)", "Paragraf (Yapı)"],
    exams: ["tyt_ayt", "tyt", "dil"],
  },
  {
    key: "problem", label: "Problem", subject: "matematik", subjectLabel: "Matematik", questions: 10,
    pool: [
      "Problemler (Dört İşlem)", "Problemler (Kesir)", "Problemler (Yüzde)", "Problemler (Kar-Zarar)",
      "Problemler (Hız)", "Problemler (İşçi)", "Problemler (Yaş)", "Problemler (Sayı)",
    ],
    exams: ["tyt_ayt", "tyt", "dil"],
  },
  {
    key: "kelime", label: "Kelime", subject: "ydt_ingilizce", subjectLabel: "İngilizce", questions: 20,
    pool: ["Vocabulary in Context"], exams: ["dil"],
  },
  {
    key: "okuma", label: "Okuma", subject: "ydt_ingilizce", subjectLabel: "İngilizce", questions: 10,
    pool: ["Reading Comprehension"], exams: ["dil"],
  },
];

export const HABIT_QUESTION_RANGE = [5, 60];
const MINUTES_PER_QUESTION = 1.5;

export function presetsForExam(examType) {
  return HABIT_PRESETS.filter((p) => p.exams.includes(examType || "tyt_ayt"));
}

/** Kayitli tercih ({ key, questions }[]) -> etkin rutinler (preset + adet). */
export function resolveHabits(saved = [], examType) {
  const available = new Map(presetsForExam(examType).map((p) => [p.key, p]));
  return (saved || [])
    .filter((h) => available.has(h?.key))
    .map((h) => {
      const preset = available.get(h.key);
      const [lo, hi] = HABIT_QUESTION_RANGE;
      const questions = Math.min(hi, Math.max(lo, Math.round(Number(h.questions) || preset.questions)));
      return { ...preset, questions };
    });
}

/** Haftalik yuk: rota butcesinden dusulecek soru/dakika. */
export function habitWeeklyLoad(habits = [], studyDaysPerWeek = 5) {
  const perDay = habits.reduce((n, h) => n + h.questions, 0);
  const days = Math.max(1, Math.min(7, studyDaysPerWeek));
  return { questionsPerWeek: perDay * days, minutesPerWeek: Math.round(perDay * days * MINUTES_PER_QUESTION) };
}

// Havuzdan bugunun konusu: en az cozulen, sonra en dusuk dogruluk; esitlikte
// gun sirasina gore donusum (her gun ayni konu gelmesin).
function pickTopic(habit, progress = {}, dayIndex = 0) {
  const scored = habit.pool.map((topic, i) => {
    const tp = progress?.[habit.subject]?.[topic] || {};
    const q = Number(tp.total_questions) || 0;
    const acc = q > 0 ? (Number(tp.correct_count) || 0) / q : 0;
    return { topic, q, acc, rot: (i - dayIndex + habit.pool.length * 100) % habit.pool.length };
  });
  scored.sort((a, b) => (Math.min(a.q, 40) - Math.min(b.q, 40)) || (a.acc - b.acc) || (a.rot - b.rot));
  return scored[0]?.topic || habit.pool[0];
}

/**
 * Bir gunun rutin duraklari.
 * @param logsOfDay o gunun calisma kayitlari (tamamlanma icin)
 * @param dayIndex  gunun sirasi (donusum icin; ornegin epoch gunu)
 */
export function habitStopsForDay({ habits = [], dateKey, logsOfDay = [], progressByKey = {}, dayIndex = 0 } = {}) {
  if (!dateKey) return [];
  return habits.map((habit) => {
    const inPool = new Set(habit.pool);
    const solved = (logsOfDay || [])
      .filter((l) => l.subject === habit.subject && inPool.has(l.topic))
      .reduce((n, l) => n + (Number(l.question_count ?? l.questionCount) || 0), 0);
    const done = solved >= habit.questions;
    const topic = pickTopic(habit, progressByKey, dayIndex);
    return {
      subject: habit.subject,
      subjectLabel: habit.subjectLabel,
      topic,
      habitKey: habit.key,
      habitLabel: habit.label,
      isHabit: true,
      cost: { questions: habit.questions, minutes: Math.round(habit.questions * MINUTES_PER_QUESTION) },
      reasonCodes: ["DAILY_HABIT"],
      lifecycleStatus: done ? "completed" : "upcoming",
      // Gunluk plan "bugun biten" duragi bu bayrakla ayirir.
      completedToday: done,
      insight: { reasonText: `Günlük rutin · her gün ${habit.questions} soru ${habit.label.toLocaleLowerCase("tr-TR")}`, confidence: "high" },
      habitProgress: Math.min(solved, habit.questions),
      logicalStopKey: `habit:${habit.key}:${dateKey}`,
    };
  });
}
