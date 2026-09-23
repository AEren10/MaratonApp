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

    default:
      return null;
  }
}

// Ray sabit degil, ana gore siralanir (tasarim): oturum bitince Sayilar ve
// Rota one gelir, deneme girilince Net, sinava az kalinca Geri sayim.
function rankFor(moment, ctx) {
  const soon = pos(ctx.daysToExam) != null && ctx.daysToExam <= COUNTDOWN_SOON_DAYS;
  const head = moment === STORY_MOMENT.TRIAL
    ? [STORY_KIND.NET, STORY_KIND.ROTA, STORY_KIND.ISTATISTIK]
    : [STORY_KIND.ISTATISTIK, STORY_KIND.ROTA, STORY_KIND.KART];
  const tail = [STORY_KIND.SERI, STORY_KIND.SADE, STORY_KIND.DURUST, STORY_KIND.GERISAYIM];
  const order = [...head, ...tail.filter((k) => !head.includes(k))];
  if (soon) {
    return [STORY_KIND.GERISAYIM, ...order.filter((k) => k !== STORY_KIND.GERISAYIM)];
  }
  return order;
}

/**
 * Paylasilabilir varyantlar, ana gore sirali. Verisi olmayan varyant listeye
 * HIC girmez — kullaniciya bos etiket sunulmaz.
 */
export function buildStoryVariants(ctx = {}, moment = STORY_MOMENT.GENERIC) {
  const out = [];
  for (const kind of rankFor(moment, ctx)) {
    const data = variantData(kind, ctx);
    if (!data) continue;
    // "kart" tasarimda yalniz marka zemininde yasar, digerleri iki zeminde de.
    const backgrounds = kind === STORY_KIND.KART
      ? [STORY_BG.MARKA]
      : [STORY_BG.FOTO, STORY_BG.MARKA];
    for (const background of backgrounds) {
      out.push({ key: `${kind}_${background}`, kind, background, data });
    }
  }
  return out;
}
