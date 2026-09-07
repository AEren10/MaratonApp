import { dateKey } from "../../lib/dateUtils";
export function formatDateLong(date) {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateISO(date) {
  return dateKey(date);
}

export function getRecentDays(count = 7) {
  const days = [];
  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(12, 0, 0, 0);
    days.push({
      date,
      iso: formatDateISO(date),
      day: date.getDate(),
      dayName: i === 0 ? "Bugün" : i === 1 ? "Dün" : dayNames[date.getDay()],
    });
  }

  return days;
}
