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
export function scheduleWeeks(items, capacity, weeksLeft, { daysLeft = null } = {}) {
  const fullQuestionBudget = Math.max(1, Math.round(capacity.questionsPerWeek * NEW_TOPIC_SHARE));
  const fullMinuteBudget = Math.max(1, Math.round(capacity.minutesPerWeek * NEW_TOPIC_SHARE));
  const weeks = [];
  const queue = [...items];
  let overflow = [];

  for (let w = 0; w < weeksLeft; w++) {
    const isPartialLastWeek = daysLeft != null && w === weeksLeft - 1 && daysLeft % 7 > 0;
    const fraction = isPartialLastWeek ? (daysLeft % 7) / 7 : 1;
    const questionBudget = Math.max(1, Math.floor(fullQuestionBudget * fraction));
    const minuteBudget = Math.max(1, Math.floor(fullMinuteBudget * fraction));
    let questionsLeft = questionBudget;
    let minutesLeft = minuteBudget;
    const stops = [];

    // Öncelik sırasını koruyarak bütçeye SIĞAN ilk konuyu al. Sığmayan ilk
    // konuda döngüyü kırmak haftaları yarı boş bırakıyordu (78 bütçelik
    // haftada 36 soru), yani rota gereksiz uzuyordu.
    let idx = 0;
    while (idx < queue.length && questionsLeft > 0 && minutesLeft > 0) {
      const questionCost = Math.max(1, Number(queue[idx].cost.questions) || 1);
      const minuteCost = Math.max(1, Number(queue[idx].cost.minutes) || 1);
      if (questionCost <= questionsLeft && minuteCost <= minutesLeft) {
        const [picked] = queue.splice(idx, 1);
        stops.push({ ...picked, position: stops.length });
        questionsLeft -= questionCost;
        minutesLeft -= minuteCost;
        idx = 0; // baştan tara: öncelik sırası korunsun
        continue;
      }
      idx += 1;
    }

    // Hiçbiri sığmadıysa, en öncelikli konu tek başına bir haftadan büyüktür.
    // Bölerek koy ki plan tıkanmasın (tasarımda "devam eden durak").
    if (stops.length === 0 && queue.length > 0) {
      const next = queue.shift();
      const questionCost = Math.max(1, Number(next.cost.questions) || 1);
      const minuteCost = Math.max(1, Number(next.cost.minutes) || 1);
      const ratio = Math.min(1, questionsLeft / questionCost, minutesLeft / minuteCost);
      const allocatedQuestions = Math.min(questionsLeft, Math.max(1, Math.floor(questionCost * ratio)));
      const allocatedMinutes = Math.min(minutesLeft, Math.max(1, Math.ceil(minuteCost * ratio)));
      stops.push({
        ...next,
        cost: { ...next.cost, questions: allocatedQuestions, minutes: allocatedMinutes },
        partial: allocatedQuestions < questionCost || allocatedMinutes < minuteCost,
        plannedQuestions: allocatedQuestions,
        position: 0,
      });
      const remainingQuestions = questionCost - allocatedQuestions;
      const remainingMinutes = minuteCost - allocatedMinutes;
      if (remainingQuestions > 0 || remainingMinutes > 0) {
        queue.unshift({
          ...next,
          cost: {
            ...next.cost,
            questions: Math.max(0, remainingQuestions),
            minutes: Math.max(0, remainingMinutes),
          },
          continued: true,
        });
      }
      questionsLeft -= allocatedQuestions;
      minutesLeft -= allocatedMinutes;
    }

    if (stops.length === 0 && queue.length === 0) break;

    weeks.push({
      weekNo: w + 1,
      isCurrent: w === 0,
      stops,
      plannedQuestions: questionBudget - questionsLeft,
      plannedMinutes: stops.reduce(
        (sum, stop) => sum + Number(stop.cost?.minutes || 0),
        0,
      ),
      budgetQuestions: questionBudget,
      budgetMinutes: minuteBudget,
      capacityFraction: fraction,
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
