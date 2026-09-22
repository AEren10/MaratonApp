import { TAB_STACKS, TAB_KEYS } from "./tabAssignment";
import { SCREENS } from "../constants/screens";

export const TAB_ROOT_MAP = Object.freeze({
  [SCREENS.HOME]: SCREENS.HOME_ROOT,
  [SCREENS.CURRICULUM_MAP]: SCREENS.CURRICULUM_MAP_ROOT,
  [SCREENS.ANALYSIS]: SCREENS.ANALYSIS_ROOT,
  [SCREENS.PROFILE]: SCREENS.PROFILE_ROOT,
});

// Baska sekmenin stack'indeki ekrani o sekmede acar. React Navigation 7'de
// ic ice ekrana adiyla navigate() yalniz ayni stack'te calisir; tasarimda
// sekmesi belli olan ekranlar (Yol Haritasi, Program, Aylik Plan -> PROGRAM)
// bu yolla acilir. initial:false -> geri, sekmenin kokune doner.
export function openInTab(navigation, tab, screen, params) {
  // Eger hedef ekran sekmenin koku ise (veya sekme adiyla cagirildiysa),
  // ic stack'teki gercek kok ekran adina (_ROOT) cevrilir. Boylece React
  // Navigation'in "The screen X passed in params couldn't be applied" hatasi onlenir.
  const targetScreen = (screen && TAB_ROOT_MAP[screen]) || screen || TAB_ROOT_MAP[tab] || tab;
  navigation.navigate(tab, { screen: targetScreen, params, initial: false });
}

// Iki sekmede birden yasayan ekran icin: kullanici zaten sahibi olan bir
// sekmedeyse orada ac, degilse sahibine atla. Duz openInTab boyle ekranlarda
// calisan bir butonu da sekme atlatir hale getiriyordu.
export function openHere(navigation, fallbackTab, screen, params) {
  let nav = navigation;
  while (nav) {
    const state = nav.getState?.();
    if (state?.type === "tab") {
      const active = state.routes?.[state.index]?.name;
      if (active && TAB_STACKS[active]?.includes(screen)) {
        navigation.navigate(screen, params);
        return;
      }
      break;
    }
    nav = nav.getParent?.();
  }
  openInTab(navigation, fallbackTab, screen, params);
}
