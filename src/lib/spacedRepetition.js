// G) Sade SM-2 benzeri spaced repetition.
// grade: 0 = hatırlamıyorum (yine yanlış), 1 = zor, 2 = orta, 3 = kolay.

const MIN_EASE = 1.3;

// Mevcut karttan sonraki tekrar parametrelerini hesaplar.
// card: { interval_days, ease }
export function computeNextReview(card, grade) {
  const prevInterval = card?.interval_days || 1;
  let ease = card?.ease || 2.5;
  let interval;

  if (grade <= 0) {
    // Başa dön: yarın tekrar, ease biraz düşer.
    interval = 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
  } else {
    // SM-2 ease ayarı (grade 1..3 → q 3..5 benzeri)
    const q = grade + 2; // 1→3, 2→4, 3→5
    ease = Math.max(MIN_EASE, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (prevInterval <= 1) {
      interval = grade >= 3 ? 4 : 2;
    } else {
      interval = Math.round(prevInterval * ease);
    }
  }

  const now = new Date();
  const next = new Date(now.getTime() + interval * 86400000);
  return {
    interval_days: interval,
    ease: Math.round(ease * 100) / 100,
    last_reviewed_at: now.toISOString(),
    next_review_at: next.toISOString(),
  };
}

// İlk kez SR'a alınan bir yanlış için başlangıç değerleri (yarın tekrar).
export function initialReview() {
  const next = new Date(Date.now() + 86400000);
  return {
    interval_days: 1,
    ease: 2.5,
    next_review_at: next.toISOString(),
  };
}
