import { listMyChallenges, bumpMyProgress, checkExpiredChallenges } from "../supabase/challenges";

export async function syncChallengeProgress(userId, { questions = 0, minutes = 0 }) {
  if (!userId || (questions <= 0 && minutes <= 0)) return;
  try {
    await checkExpiredChallenges(userId);

    const challenges = await listMyChallenges(userId);
    const active = challenges.filter((c) => c.status === "active");
    if (!active.length) return;

    for (const c of active) {
      const side = c.creator_id === userId ? "creator" : "opponent";
      const value =
        c.metric === "questions" ? questions :
        c.metric === "study_minutes" ? minutes : 0;
      if (value <= 0) continue;

      try {
        // Hedefe ulaşıldığında tamamlama ve kazanan seçimi SUNUCUDA,
        // bump_challenge_progress'in içinde yapılıyor.
        await bumpMyProgress(c.id, side, value);
      } catch {}
    }
  } catch (_) {}
}
