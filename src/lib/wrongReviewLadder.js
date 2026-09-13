// Yanlis defteri araliklı tekrar merdiveni -- tasarimin kurali:
// "Aralıklı tekrar: 1. gün, 3. gün, 7. gün. Bildiklerin uzar, bilemediklerin
// bir kademe geriler." Son kademede bilinen soru kapanir.
//
// Kademe interval_days'ten okunur. Eski SM-2 kayitlari (2, 4, 10 gun...)
// en yakin ust kademeye oturur; veri yeniden yazilmaz.

export const REVIEW_LADDER = [1, 3, 7];
const DAY_MS = 86400000;

export function ladderStageOf(item) {
  const days = Number(item?.interval_days) || 1;
  if (days <= REVIEW_LADDER[0]) return 0;
  if (days <= REVIEW_LADDER[1]) return 1;
  return REVIEW_LADDER.length - 1;
}

export function isLastStage(stage) {
  return stage >= REVIEW_LADDER.length - 1;
}

/**
 * Tek bir tekrar sonucunu hesaplar.
 * @returns {{ updates, closes, stage, nextStage, nextDays }}
 *   updates saveReviewOffline'a olduğu gibi gider.
 */
export function gradeWrongReview(item, knew, now = new Date()) {
  const stage = ladderStageOf(item);
  const reviewedAt = now.toISOString();

  if (knew && isLastStage(stage)) {
    return {
      stage,
      nextStage: stage,
      closes: true,
      nextDays: null,
      updates: { is_resolved: true, last_reviewed_at: reviewedAt },
    };
  }

  const nextStage = knew ? stage + 1 : Math.max(0, stage - 1);
  const nextDays = knew ? REVIEW_LADDER[nextStage] : 1;
  return {
    stage,
    nextStage,
    closes: false,
    nextDays,
    updates: {
      interval_days: REVIEW_LADDER[nextStage],
      last_reviewed_at: reviewedAt,
      next_review_at: new Date(now.getTime() + nextDays * DAY_MS).toISOString(),
    },
  };
}

export function isWrongDue(item, now = new Date()) {
  if (!item || item.is_resolved || !item.next_review_at) return false;
  return new Date(item.next_review_at).getTime() <= now.getTime();
}

export function daysUntil(iso, now = new Date()) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - now.getTime();
  return Math.max(1, Math.ceil(diff / DAY_MS));
}
