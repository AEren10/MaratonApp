import { todayTR } from "../lib/dateUtils";

// Defterdeki bir yanlisin "ne zaman tekrar edilecegi" etiketi. Tasarim bu
// alani {{w.due}} olarak dinamik biraktigi icin bicimi biz seciyoruz —
// next_review_at gercek SR alanindan hesaplaniyor, uydurulmuyor.
export function dueMeta(item) {
  if (!item.next_review_at) return { label: "YENİ", tone: "muted" };
  const days = Math.ceil((new Date(item.next_review_at).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { label: "BUGÜN", tone: "warn" };
  if (days === 1) return { label: "YARIN", tone: "muted" };
  return { label: `${days} GÜN`, tone: "muted" };
}

export function lastStudyLabel(studyDate) {
  if (!studyDate) return "Henüz yok";
  const days = Math.round((Date.parse(todayTR()) - Date.parse(String(studyDate).slice(0, 10))) / 86400000);
  if (days <= 0) return "Bugün";
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

export function shortDate(value) {
  try {
    return new Date(value).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function monthLabel(date) {
  try {
    return date.toLocaleDateString("tr-TR", { month: "long" }).toUpperCase();
  } catch {
    return "";
  }
}

// "Calisma birikimi" egrisi: gunluk kayitlardan kumulatif soru sayisi.
// 2'den az veri noktasi varsa egri gosterilmiyor — cizgi uydurulmuyor.
export function buildChart(sortedLogs) {
  if (sortedLogs.length < 2) return null;
  let cumulative = 0;
  const points = sortedLogs.map((log) => {
    cumulative += log.question_count || 0;
    return { date: new Date(log.study_date), value: cumulative };
  });
  if (points[points.length - 1].value <= 0) return null;
  return {
    points,
    totalLabel: `${points[points.length - 1].value} SORU`,
    startLabel: monthLabel(points[0].date),
    endLabel: monthLabel(points[points.length - 1].date),
  };
}
