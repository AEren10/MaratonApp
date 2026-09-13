// "N GUNUN KAYDI" paneli — saf mantik (tasarim AKIS 14 · Tahmin Dogrulugu).
//
// Kaynaklar:
//   soru, saat, deneme -> gamification.stats (sunucu otoriteli toplamlar).
//     Redux'taki deneme listesi son 30 kayitla, calisma kayitlari 500 ile
//     sinirli; toplam icin KULLANILMAZ.
//   durak -> rotada tamamlanan durak sayisi (useMilestone ile ayni sayim).
//   gun   -> hesabin acildigi gunden sinav gunune. Rota baslangic tarihi
//     ayrica tutulmuyor; hesap acilisi onboarding + rota kurulumuyla ayni gun.
// Turetilemeyen alan null doner ve ekranda GOSTERILMEZ.

const MS_PER_DAY = 86400000;

const dayStart = (value) => {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const positive = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function buildExamRecap({ stats = null, completedStops = 0, startedAt = null, examDate = null } = {}) {
  const start = dayStart(startedAt);
  const exam = dayStart(examDate);
  const days = start != null && exam != null && exam >= start
    ? Math.round((exam - start) / MS_PER_DAY) + 1
    : null;

  const minutes = positive(stats?.totalMinutes);
  return {
    days,
    questions: positive(stats?.totalQuestions),
    hours: minutes != null && minutes >= 60 ? Math.round(minutes / 60) : null,
    stops: positive(completedStops),
    trials: positive(stats?.totalTrials),
  };
}

export function recapHasContent(recap) {
  if (!recap || recap.days == null) return false;
  return [recap.questions, recap.hours, recap.stops, recap.trials].some((v) => v != null);
}
