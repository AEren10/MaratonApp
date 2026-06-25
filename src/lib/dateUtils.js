const MS_PER_DAY = 86400000;

export function differenceInDays(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / MS_PER_DAY);
}

export function todayTR() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}
