// Madde 3: Streak freeze (joker gün) mantığı.
// Kullanıcı bir günü atlasa bile haftada 1 joker hakkıyla streak korunur.
// Joker her pazartesi 04:00'te yenilenir.

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

function addDays(d, n) {
  return new Date(d.getTime() + n * 86400000);
}

// Bir sonraki pazartesi 04:00 (joker yenileme anı).
export function nextMondayReset(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay(); // 0 Paz .. 1 Pzt .. 6 Cmt
  let daysUntilMonday = (1 - day + 7) % 7;
  const candidate = new Date(d);
  candidate.setHours(4, 0, 0, 0);
  if (daysUntilMonday === 0 && candidate <= now) daysUntilMonday = 7;
  candidate.setDate(candidate.getDate() + daysUntilMonday);
  return candidate;
}

/**
 * Çalışma kaydedildiğinde streak + joker durumunu hesaplar.
 * streakData: Supabase streaks satırı (null olabilir)
 * Döner: { updates (Supabase'e yazılacak alanlar), newStreak, usedFreeze, freezeCount }
 */
export function computeStreakUpdate(streakData, now = new Date()) {
  const todayStr = toDateStr(now);
  const yesterday = toDateStr(addDays(now, -1));
  const dayBefore = toDateStr(addDays(now, -2));
  const lastDate = streakData?.last_study_date;
  const current = streakData?.current_streak || 0;

  // Haftalık joker yenilemesi
  let freezeCount = streakData?.freeze_count ?? 0;
  let freezeResetAt = streakData?.freeze_reset_at ? new Date(streakData.freeze_reset_at) : null;
  if (!freezeResetAt || freezeResetAt.getTime() <= now.getTime()) {
    freezeCount = 1;
    freezeResetAt = nextMondayReset(now);
  }

  let newStreak = 1;
  let usedFreeze = false;
  let lastFreezeAt = streakData?.last_freeze_at || null;

  if (lastDate === todayStr) {
    newStreak = current || 1;
  } else if (lastDate === yesterday) {
    newStreak = current + 1;
  } else if (lastDate === dayBefore && freezeCount > 0) {
    // Tam 1 gün atlandı + joker var → streak korunur
    newStreak = current + 1;
    freezeCount -= 1;
    usedFreeze = true;
    lastFreezeAt = now.toISOString();
  } else {
    newStreak = 1;
  }

  const longest = Math.max(newStreak, streakData?.longest_streak || 0);

  return {
    updates: {
      current_streak: newStreak,
      longest_streak: longest,
      last_study_date: todayStr,
      freeze_count: freezeCount,
      last_freeze_at: lastFreezeAt,
      freeze_reset_at: freezeResetAt.toISOString(),
    },
    newStreak,
    usedFreeze,
    freezeCount,
  };
}
