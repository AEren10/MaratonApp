import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";

// Ust popup'a dokununca nereye gidilir. Kesif popup'lari (domain/notify/
// discovery) kisa ad tasir; donem karsilastirmasi Rota sekmesinde kayitli
// degil, Analiz sekmesinde acilir.
const DISCOVERY = {
  goals: { screen: SCREENS.GOALS },
  forecast: { screen: SCREENS.NET_FORECAST },
  route: { screen: SCREENS.ROADMAP },
  comparative: { tab: TAB_KEYS.ANALIZ, screen: SCREENS.COMPARATIVE },
};

export function nudgeTarget(nudge) {
  return DISCOVERY[nudge?.screen]?.screen || (nudge?.subject ? SCREENS.ANALYSIS : SCREENS.PLAN_DETAIL);
}

export function openNudge(navigation, nudge) {
  const d = DISCOVERY[nudge?.screen];
  if (d?.tab) openInTab(navigation, d.tab, d.screen);
  else navigation.navigate(nudgeTarget(nudge));
}
