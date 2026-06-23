import { listMyChallenges, bumpMyProgress } from "../supabase/challenges";

export async function syncChallengeProgress(userId, { questions = 0, minutes = 0 }) {
  if (!userId || (questions <= 0 && minutes <= 0)) return;
  try {
    const challenges = await listMyChallenges(userId);
    const active = challenges.filter((c) => c.status === "active");
    if (!active.length) return;

    const bumps = active
      .map((c) => {
        const side = c.creator_id === userId ? "creator" : "opponent";
        const value =
          c.metric === "questions" ? questions :
          c.metric === "minutes" ? minutes : 0;
        if (value <= 0) return null;
        return bumpMyProgress(c.id, side, value).catch(() => null);
      })
      .filter(Boolean);

    await Promise.all(bumps);
  } catch (_) {
    // non-blocking — challenge sync failing should never block study save
  }
}
