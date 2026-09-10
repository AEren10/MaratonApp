// KONU BORCU — planlanan ama yapılmayan iş.
//
// Tasarımda AKIŞ 7: "Konu Borcu → Borç Dağıtıldı → Plan vs Gerçek →
// Boşluğu Kapatma Planı". Kodda bu kavram hiç yoktu: plan yapılmazsa
// sessizce kayboluyordu, öğrenci geride kaldığını fark etmiyordu.
//
// Tasarım kararı: borç CEZA DEĞİL. Amaç suçluluk üretmek değil, planı
// gerçeğe geri oturtmak. Bu yüzden:
//   - borç tavanı var (bir hafta sonsuz borç taşıyamaz)
//   - eskiyen borç değersizleşir (2 aylık borcu kovalamanın anlamı yok)
//   - dağıtım kapasiteye göre yapılır, haftayı asla %100'ün üstüne çıkarmaz

const MAX_DEBT_WEEKS = 3;        // en fazla 3 haftalık iş borç sayılır
const DEBT_DECAY_DAYS = 45;      // bundan eskisi tamamen düşer
const MAX_WEEKLY_DEBT_SHARE = 0.35; // bir haftaya eklenen borç, bütçenin %35'ini geçmez

/**
 * Planlanan vs gerçekleşen karşılaştırması → borç.
 *
 * @param plannedWeeks  scheduleWeeks çıktısı (geçmiş haftalar)
 * @param actualByWeek  { [weekStartKey]: { questions, minutes } }
 */
export function computeDebt(plannedWeeks = [], actualByWeek = {}, now = new Date()) {
  const items = [];
  let totalQuestions = 0;
  // Tasarim borcu SAAT olarak gosteriyor ("12 sa borc"), soru olarak degil.
  // Hafta verisinde plannedMinutes var (scheduler.js), o yuzden kacirilan
  // sorunun dakika karsiligi ayni oranla turetiliyor.
  let totalMinutes = 0;

  for (const week of plannedWeeks) {
    if (!week.weekStart) continue;
    const actual = actualByWeek[week.weekStart] || { questions: 0 };
    const planned = week.plannedQuestions || 0;
    const done = Math.min(planned, actual.questions || 0);
    const missed = Math.max(0, planned - done);
    if (missed <= 0) continue;

    const ageDays = Math.max(0, Math.round((now - new Date(week.weekStart)) / 86400000));
    if (ageDays > DEBT_DECAY_DAYS) continue; // çok eski borç düşer

    // Eskidikçe değersizleşir: 45 günde sıfıra iner.
    const weight = 1 - ageDays / DEBT_DECAY_DAYS;
    const weighted = Math.round(missed * weight);
    if (weighted <= 0) continue;

    // Kacirilan sorunun dakika karsiligi: haftanin dakika/soru oraniyla.
    // plannedMinutes yoksa 0 kalir — uydurma oran kullanilmaz.
    const weekMinutes = week.plannedMinutes || 0;
    const weightedMinutes = planned > 0
      ? Math.round((weekMinutes / planned) * weighted)
      : 0;

    items.push({
      weekStart: week.weekStart,
      weekNo: week.weekNo,
      plannedQuestions: planned,
      doneQuestions: done,
      missedQuestions: missed,
      weightedQuestions: weighted,
      weightedMinutes,
      ageDays,
      completion: planned > 0 ? Math.round((done / planned) * 100) : 100,
      subjects: (week.stops || []).map((s) => s.subjectLabel || s.subject).filter(Boolean),
    });
    totalQuestions += weighted;
    totalMinutes += weightedMinutes;
  }

  return {
    items,
    totalQuestions,
    totalMinutes,
    hasDebt: totalQuestions > 0,
    // Kaç haftalık işe denk geldiğini çağıran taraf kapasiteyle hesaplar.
  };
}

/**
 * Borcu MAX_DEBT_WEEKS haftalık işle sınırlar.
 *
 * Tavan olmadan uzun süre ara veren kullanıcı "12 haftalık borcun var"
 * ekranıyla karşılaşır ve uygulamayı bırakır. MAX_DEBT_WEEKS sabiti tanımlıydı
 * ama hiçbir yerde kullanılmıyordu — yorum kodda karşılıksızdı.
 */
export function capDebt(debt, capacity) {
  const perWeek = Math.max(1, capacity?.questionsPerWeek || 1);
  const ceiling = Math.round(perWeek * MAX_DEBT_WEEKS);
  if (!debt || debt.totalQuestions <= ceiling) return { ...debt, capped: false };
  return {
    ...debt,
    totalQuestions: ceiling,
    capped: true,
    originalQuestions: debt.totalQuestions,
  };
}

/**
 * Borcu kalan haftalara dağıt.
 *
 * Kritik kural: hiçbir hafta kapasitesinin üstüne çıkmaz. Aksi halde borç
 * kartopu olur, plan imkânsızlaşır ve kullanıcı uygulamayı bırakır.
 * Sığmayan borç "kapatılamayan" olarak açıkça bildirilir — tasarımdaki
 * "Boşluğu Kapatma Planı" bu bilgiyle dürüst bir seçenek sunabilir.
 */
export function distributeDebt(debtQuestions, upcomingWeeks = [], capacity) {
  if (!debtQuestions || debtQuestions <= 0 || upcomingWeeks.length === 0) {
    return { weeks: upcomingWeeks, assigned: 0, uncovered: debtQuestions || 0 };
  }

  const budget = Math.max(10, capacity?.questionsPerWeek || 0);
  const perWeekCap = Math.round(budget * MAX_WEEKLY_DEBT_SHARE);

  let remaining = debtQuestions;
  const weeks = upcomingWeeks.map((week) => {
    if (remaining <= 0) return { ...week, debtQuestions: 0 };
    // Haftanın BOŞ KALAN payı kadar, tavanı da aşmadan.
    //
    // Önceki hali `Math.min(remaining, perWeekCap, free + perWeekCap)` idi;
    // üçüncü terim her zaman perWeekCap'ten büyük olduğu için ETKİSİZDİ.
    // Sonuç: hafta zaten doluyken (free = 0) üstüne yine perWeekCap ekleniyor
    // ve "hiçbir hafta kapasitesini aşmaz" iddiası tutmuyordu.
    const free = Math.max(0, (week.budgetQuestions || budget) - (week.plannedQuestions || 0));
    const take = Math.min(remaining, perWeekCap, free);
    remaining -= take;
    return {
      ...week,
      debtQuestions: take,
      totalQuestions: (week.plannedQuestions || 0) + take,
    };
  });

  return {
    weeks,
    assigned: debtQuestions - remaining,
    uncovered: remaining,
  };
}

/** Borç kaç haftalık işe denk geliyor — kullanıcıya anlamlı birim. */
export function debtInWeeks(debtQuestions, capacity) {
  const perWeek = Math.max(1, capacity?.questionsPerWeek || 1);
  return Math.round((debtQuestions / perWeek) * 10) / 10;
}

export const DEBT_LIMITS = { MAX_DEBT_WEEKS, DEBT_DECAY_DAYS, MAX_WEEKLY_DEBT_SHARE };
