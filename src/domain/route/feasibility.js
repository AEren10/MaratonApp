// YETISEBILIR MI -- rotanin durust cumlesi.
//
// Motor sinava sigmayan isi (shortfall) hesapliyordu ama HICBIR ekran onu
// gostermiyordu: ogrenci "plan veriyor, demek ki yetisiyorum" saniyordu.
// Kibar ama net: kac konu yetismiyor, gunde kac soru eklenirse yetisir.

const NEW_TOPIC_SHARE = 0.65; // scheduler.js ile ayni: haftanin yeni konu payi

export function feasibilityNote({ shortfall, capacity, weeksLeft } = {}) {
  const topics = Number(shortfall?.topics) || 0;
  const questions = Number(shortfall?.questions) || 0;
  if (topics <= 0 || questions <= 0 || !(weeksLeft > 0)) return null;
  // Yeni konu payi %65: sigmayan soruyu kapatmak icin toplam temponun ne
  // kadar artmasi gerektigi.
  const extraPerWeek = questions / weeksLeft / NEW_TOPIC_SHARE;
  const extraPerDay = Math.max(1, Math.ceil(extraPerWeek / 7));
  const currentPerDay = Math.round((Number(capacity?.questionsPerWeek) || 0) / 7);
  return {
    topics,
    extraPerDay,
    targetPerDay: currentPerDay + extraPerDay,
    title: `Bu tempoyla ${topics} konu sınava yetişmiyor`,
    detail: `Günde ${extraPerDay} soru daha eklersen yetişir (günde ${currentPerDay + extraPerDay}).`,
  };
}
