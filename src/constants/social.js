import { SCREENS } from "./screens.js";

// SOSYAL V1 DISI (2026-10-02). Lig, gruplar, arkadaslar, meydan okuma ve yol
// arkadasi V1'de gorunmez: urun odagi "bugun ne calisacagim" ve grup/sohbet
// icerikleri icin tam moderasyon (sikayet, engelleme) henuz yok -- App Review
// riski. Kod SILINMEDI; bu bayragi true yapmak yeterli. Davet (referral)
// sosyal degil, uygulamaya davet: acik kalir.
export const SOCIAL_ENABLED = false;

export const SOCIAL_SCREENS = new Set([
  SCREENS.LEAGUE,
  SCREENS.FRIENDS,
  SCREENS.CHALLENGE,
  SCREENS.ROUTE_COMPANION,
]);
