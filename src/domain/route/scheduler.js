// Konuları haftalara KAPASİTEYE göre yerleştirir.
//
// Eski motor `Math.ceil(konuSayısı / haftaSayısı)` ile eşit bölüyordu; bu,
// haftanın gerçekten kaç soruya yettiğini hiç sormuyordu. Burada her hafta
// bir soru/dakika bütçesidir ve konular bütçe dolana kadar konur.

// Bir haftanın bütçesinin tamamı yeni konuya verilmez: tekrar, deneme ve
// yanlış defteri için pay ayrılır. Aksi halde plan "sadece yeni konu"ya
// dönüşür ve öğrenci öğrendiğini unutur.
const NEW_TOPIC_SHARE = 0.65;

/**
 * @param items     [{ ...topic, cost, score }] öncelik sırasında
 * @param capacity  { questionsPerWeek, minutesPerWeek }
 * @param weeksLeft kaç hafta planlanacak
 */
export function scheduleWeeks(items, capacity, weeksLeft) {
  const weeklyQuestionBudget = Math.max(10, Math.round(capacity.questionsPerWeek * NEW_TOPIC_SHARE));
  const weeks = [];
  const queue = [...items];
  let overflow = [];

  for (let w = 0; w < weeksLeft; w++) {
    let budget = weeklyQuestionBudget;
    const stops = [];

    // Öncelik sırasını koruyarak bütçeye SIĞAN ilk konuyu al. Sığmayan ilk
    // konuda döngüyü kırmak haftaları yarı boş bırakıyordu (78 bütçelik
    // haftada 36 soru), yani rota gereksiz uzuyordu.
    let idx = 0;
    while (idx < queue.length && budget > 0) {
      const cost = queue[idx].cost.questions;
      if (cost <= budget) {
        const [picked] = queue.splice(idx, 1);
        stops.push(picked);
        budget -= cost;
        idx = 0; // baştan tara: öncelik sırası korunsun
        continue;
      }
      idx += 1;
    }

    // Hiçbiri sığmadıysa, en öncelikli konu tek başına bir haftadan büyüktür.
    // Bölerek koy ki plan tıkanmasın (tasarımda "devam eden durak").
    if (stops.length === 0 && queue.length > 0) {
      const next = queue.shift();
      const cost = next.cost.questions;
      stops.push({ ...next, partial: true, plannedQuestions: weeklyQuestionBudget });
      const remaining = cost - weeklyQuestionBudget;
      if (remaining > 0) {
        queue.unshift({
          ...next,
          cost: { ...next.cost, questions: remaining },
          continued: true,
        });
      }
      budget = 0;
    }

    if (stops.length === 0 && queue.length === 0) break;

    weeks.push({
      weekNo: w + 1,
      isCurrent: w === 0,
      stops,
      plannedQuestions: weeklyQuestionBudget - budget,
      budgetQuestions: weeklyQuestionBudget,
      focusSubjects: topFocus(stops),
    });
  }

  // Süreye sığmayanlar — kullanıcıya dürüstçe söylenecek.
  overflow = queue;

  return { weeks, overflow };
}

function topFocus(stops) {
  const counts = {};
  for (const s of stops) {
    const key = s.subjectLabel || s.subject;
    if (!key) continue;
    counts[key] = (counts[key] || 0) + (s.cost?.questions || 1);
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);
}

/**
 * Sınava kalan güne göre planlanacak hafta sayısı.
 * Eski motor 12 haftada sabitliyordu — YKS hazırlığı 6-12 ay sürüyor,
 * dolayısıyla 12 haftanın ötesi hiç planlanmıyordu.
 */
export function weeksUntilExam(daysLeft, { min = 1, max = 60 } = {}) {
  if (daysLeft == null) return 12;
  return Math.max(min, Math.min(max, Math.ceil(daysLeft / 7)));
}
