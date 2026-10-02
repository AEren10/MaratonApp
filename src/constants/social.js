import { SCREENS } from "./screens.js";

// SOSYAL ACIK (kullanici karari, 2026-10-02): arkadaslar ikonu, gruplar,
// meydan okuma ve davet linkleri V1'de kalir. Kapatmak gerekirse (or. App
// Review moderasyon sorusu) bu bayrak false yapilir; kod ona gore dallanir.
export const SOCIAL_ENABLED = true;

export const SOCIAL_SCREENS = new Set([
  SCREENS.LEAGUE,
  SCREENS.FRIENDS,
  SCREENS.CHALLENGE,
  SCREENS.ROUTE_COMPANION,
]);
