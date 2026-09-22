// Haftanin emek tablosu: 7 gun, her gun kac soru ve kac dakika.
//
// NEDEN SORU **VE** DAKIKA
// Canli veride calisma kayitlarinin yarisina yakininda sure var ama soru yok
// (kronometreyle calisilmis, soru girilmemis). Yalniz soru sayisina bakan bir
// grafik o gunleri BOMBOS gosterir: adam iki saat calismis, ekran "hicbir sey
// yapmadin" der. Bu yuzden soru girilmemis ama calisilmis gun ayri bir hal
// olarak isaretleniyor -- sifir degil, ama hedefe de sayilmiyor.
//
// Gun sirasi Pazartesi=0 ... Pazar=6; uygulamanin her yerinde boyle
// (useHomeWeekLogs ile ayni kural).

export const WEEK_DAYS = Object.freeze(["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"]);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const logQuestions = (log) => num(log?.questionCount ?? log?.question_count);
// Redux kopyasi `duration`, sunucu satiri `duration_minutes` diyor.
const logMinutes = (log) => num(log?.duration ?? log?.duration_minutes);

function dayIndexOf(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

// 1240 -> "1.240"
export function groupThousands(value) {
  const n = Math.round(num(value));
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 490 -> "8 sa 10 dk", 45 -> "45 dk"
export function formatMinutes(value) {
  const total = Math.round(num(value));
  if (total < 60) return `${total} dk`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
}

export function buildWeeklyEffort({ logs = [], dailyGoal = 0 } = {}) {
  const days = WEEK_DAYS.map((label) => ({
    label, questions: 0, minutes: 0, worked: false, minutesOnly: false,
  }));

  for (const log of logs || []) {
    const index = dayIndexOf(log?.study_date ?? log?.studyDate ?? log?.date);
    if (index == null) continue;
    days[index].questions += logQuestions(log);
    days[index].minutes += logMinutes(log);
  }

  for (const day of days) {
    day.worked = day.questions > 0 || day.minutes > 0;
    day.minutesOnly = day.questions === 0 && day.minutes > 0;
  }

  const goal = num(dailyGoal);
  const totalQuestions = days.reduce((sum, d) => sum + d.questions, 0);
  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);

  // Olcek: en yuksek gun ile hedef arasindaki buyuk olan. Hedef cizgisi
  // tuvalin disina dusmesin, hedefi asan gun de kirpilmasin.
  const peak = days.reduce((max, d) => Math.max(max, d.questions), 0);
  const maxValue = Math.max(peak, goal, 1);

  const parts = [];
  if (totalQuestions > 0) parts.push(`${groupThousands(totalQuestions)} soru`);
  if (totalMinutes > 0) parts.push(formatMinutes(totalMinutes));

  return {
    days,
    goal,
    maxValue,
    totalQuestions,
    totalMinutes,
    // Hicbir sey yoksa cumle de yok — bos yer tutucu yazmiyoruz.
    summary: parts.length ? `Bu hafta ${parts.join(" · ")}` : null,
    hasAny: days.some((d) => d.worked),
    // Hedefi tutturulan gun sayisi; hedef yoksa anlamsiz.
    goalMetDays: goal > 0 ? days.filter((d) => d.questions >= goal).length : 0,
  };
}
