import {
  checkExpiredChallenges,
  syncMyChallengeProgress,
} from "../supabase/challenges";

export async function syncChallengeProgress(
  userId,
  { questions = 0, minutes = 0, source = "study_log", sourceOperationId = null } = {},
) {
  if (!userId || (questions <= 0 && minutes <= 0)) return;
  try {
    await checkExpiredChallenges(userId);

    if (!sourceOperationId) return;
    await syncMyChallengeProgress({ source, sourceOperationId });
  } catch (_) {}
}
