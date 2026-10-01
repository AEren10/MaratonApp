// Grup serisinin cumlesi. Gun, o gun gruptaki herkes calistiysa sayilir
// (sunucu: get_group_streak). Eksik olani soyler, suclamaz.
export function groupStreakLine({ streak = 0, today_done: done = 0, members = 0 } = {}) {
  if (members <= 1) return "Arkadaşını davet et: grup serisi herkes çalışınca sayılır.";
  if (done >= members) return `Bugün herkes çalıştı. Seri ${streak} gün.`;
  return `Bugün ${done}/${members} çalıştı. Herkes bir durak kapatınca seri ${streak + 1} olur.`;
}
