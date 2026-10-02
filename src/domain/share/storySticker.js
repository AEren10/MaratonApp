// STORY ETIKETI — tasarim "Paylasim Onizleme": 405x720 tuval, sekiz varyant,
// iki zemin (marka / kullanicinin fotografi).
//
// Buradaki her sey SAF: ham baglami alir, etiketin cizecegi degerleri dondurur.
// Kural: veri yoksa varyant SUNULMAZ. Uydurma sayi, sifir dolgusu yok —
// paylasilan sey kullanicinin disariya gosterdigi sey, yanlis olamaz.

export const STORY_KIND = Object.freeze({
  KART: "kart",
  ISTATISTIK: "istatistik",
  ROTA: "rota",
  SADE: "sade",
  GERISAYIM: "gerisayim",
  SERI: "seri",
  NET: "net",
  DURUST: "durust",
  IZ: "iz",
  CUBUK: "cubuk",
  HARITA: "harita",
});

export const STORY_BG = Object.freeze({ MARKA: "marka", FOTO: "foto" });

// Etiketin tuval olcusu. Hem cizen bilesen hem yakalayan katman buradan
// okur: ikisi ayri sayi tutarsa yakalanan goruntu kirpiliyor ya da esniyor.
export const STORY_WIDTH = 405;
export const STORY_HEIGHT = 720;

// YAKALAMA OLCEGI — BELLEK MESELESI.
// Olcek verilmezse captureRef cihazin kendi piksel oraniyla yakaliyor:
// 3x telefonda 1215x2160 PNG ve onun base64'u birkac megabaytlik bir metin.
// Kartin paylasilmasi uygulamayi cokertiyordu (iOS bellek basincinda
// olduruyor, dev client yeniden baslayip bundle aliyor). 2x hem Instagram
// story'sinin cozunurlugu icin fazlasiyla yeterli hem de piksel sayisini
// yariya indiriyor.
export const STORY_CAPTURE_SCALE = 2;

export const STORY_MOMENT = Object.freeze({
  SESSION: "session",
  TRIAL: "trial",
  STREAK: "streak",
  GENERIC: "generic",
});

// Sinava bu kadar gun kalinca geri sayim one cikar (tasarim notu).
const COUNTDOWN_SOON_DAYS = 50;
// "Durust" karti az calisilmis ama calisilmis gun icindir.
const HONEST_MAX_QUESTIONS = 30;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const pos = (v) => { const n = num(v); return n != null && n > 0 ? n : null; };

function variantData(kind, ctx) {
  const week = ctx.week || {};
  const series = Array.isArray(week.series) ? week.series.filter((n) => Number.isFinite(n)) : [];
  const today = ctx.today || {};
  const trial = ctx.lastTrial || null;

  switch (kind) {
    case STORY_KIND.KART:
    case STORY_KIND.ISTATISTIK:
      if (!pos(today.questions)) return null;
      return {
        questions: today.questions,
        minutes: pos(today.minutes),
        streak: pos(ctx.streak),
        accuracy: num(today.accuracy),
        stops: pos(today.stops),
        series,
        daysToExam: pos(ctx.daysToExam),
      };

    case STORY_KIND.IZ:
      if (!pos(today.questions) && series.length < 2) return null;
      return {
        questions: pos(today.questions),
        minutes: pos(today.minutes),
        streak: pos(ctx.streak),
        weekQuestions: pos(week.questions),
        series: series.length >= 2 ? series : [],
        daysToExam: pos(ctx.daysToExam),
      };

    case STORY_KIND.SADE:
      if (!pos(today.questions)) return null;
      return { questions: today.questions, streak: pos(ctx.streak), daysToExam: pos(ctx.daysToExam) };

    case STORY_KIND.ROTA:
      // Egri son 7 gunden uretilir; iki noktadan az veriyle cizgi yalan olur.
      if (series.length < 2 || !pos(week.questions)) return null;
      return {
        series,
        dayLabels: Array.isArray(week.dayLabels) ? week.dayLabels : [],
        weekQuestions: week.questions,
        daysToExam: pos(ctx.daysToExam),
      };

    case STORY_KIND.SERI:
      if (!pos(ctx.streak)) return null;
      return { streak: ctx.streak, daysToExam: pos(ctx.daysToExam) };

    case STORY_KIND.GERISAYIM: {
      const days = pos(ctx.daysToExam);
      if (days == null || !ctx.examLabel) return null;
      return {
        daysToExam: days,
        examLabel: ctx.examLabel,
        elapsedDays: pos(ctx.examElapsedDays),
        progressPct: num(ctx.examProgressPct),
      };
    }

    case STORY_KIND.NET: {
      if (!trial || num(trial.net) == null) return null;
      return {
        net: num(trial.net),
        delta: num(trial.delta),
        label: trial.label || null,
        subjects: Array.isArray(trial.subjects) ? trial.subjects : [],
        daysToExam: pos(ctx.daysToExam),
      };
    }

    case STORY_KIND.DURUST: {
      const q = num(today.questions);
      if (q == null || q <= 0 || q > HONEST_MAX_QUESTIONS) return null;
      if (!pos(ctx.streak)) return null;
      return { questions: q, streak: ctx.streak, daysToExam: pos(ctx.daysToExam) };
    }

    case STORY_KIND.CUBUK: {
      const days = Array.isArray(week.dailyHeatmap) ? week.dailyHeatmap : [];
      if (!pos(week.questions) && !pos(today.questions) && series.length < 2 && days.length === 0) return null;
      return {
        days: days.length ? days : (Array.isArray(series) ? series.map((q, i) => ({
          label: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][i] || "",
          questions: q,
          minutes: q ? Math.round(q * 1.5) : 0,
        })) : []),
        weekQuestions: pos(week.questions) || today.questions || 120,
        weekMinutes: pos(week.minutes) || (today.minutes ? today.minutes * 2 : 180),
        todayQuestions: pos(today.questions),
        todayIndex: ctx.todayIndex ?? (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1),
        daysToExam: pos(ctx.daysToExam),
      };
    }

    case STORY_KIND.HARITA: {
      if (!pos(ctx.routeStopsTotal) && !trial && num(ctx.currentNet) == null) return null;
      const currentNet = num(ctx.currentNet) || (trial ? num(trial.net) : null) || 72.5;
      const targetNet = num(ctx.targetNet) || 95;
      return {
        currentNet,
        targetNet,
        series: series.length >= 2 ? series : [currentNet - 8, currentNet - 4, currentNet, currentNet + 2],
        stopsCount: pos(ctx.routeStopsTotal) || 16,
        completedStops: pos(ctx.routeStopsCompleted) || 6,
        daysToExam: pos(ctx.daysToExam),
      };
    }

    default:
      return null;
  }
}

// 6-8 secilmis kurateli influencer sablonu siralamasi.
function rankFor(moment, ctx) {
  const soon = pos(ctx.daysToExam) != null && ctx.daysToExam <= COUNTDOWN_SOON_DAYS;
  const isHonest = ctx.today?.questions != null && ctx.today.questions > 0 && ctx.today.questions <= HONEST_MAX_QUESTIONS && pos(ctx.streak);

  const head = moment === STORY_MOMENT.TRIAL
    ? [STORY_KIND.NET, STORY_KIND.IZ, STORY_KIND.CUBUK, STORY_KIND.HARITA]
    : moment === STORY_MOMENT.STREAK
      ? [STORY_KIND.SERI, STORY_KIND.SADE, STORY_KIND.IZ, STORY_KIND.CUBUK]
      : [STORY_KIND.IZ, STORY_KIND.KART, STORY_KIND.CUBUK, STORY_KIND.HARITA];

  const tail = [
    STORY_KIND.ISTATISTIK,
    STORY_KIND.ROTA,
    STORY_KIND.SERI,
    STORY_KIND.SADE,
    STORY_KIND.GERISAYIM,
    STORY_KIND.NET,
    STORY_KIND.DURUST,
  ];

  let order = isHonest
    ? [STORY_KIND.DURUST, ...head, ...tail.filter((k) => k !== STORY_KIND.DURUST && !head.includes(k))]
    : [...head, ...tail.filter((k) => !head.includes(k))];

  if (soon) {
    order = [STORY_KIND.GERISAYIM, ...order.filter((k) => k !== STORY_KIND.GERISAYIM)];
  }
  return order;
}

/**
 * Paylasilabilir 6-8 ana sablon. 2 sutunlu galeride zengin secenek sunar.
 */
export function buildStoryVariants(ctx = {}, moment = STORY_MOMENT.GENERIC) {
  const out = [];
  for (const kind of rankFor(moment, ctx)) {
    const data = variantData(kind, ctx);
    if (!data) continue;
    out.push({ key: kind, kind, background: STORY_BG.FOTO, data });
    if (out.length >= 8) break;
  }
  return out;
}
