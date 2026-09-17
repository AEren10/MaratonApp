import { TAB_STACKS } from "./tabAssignment";

// Baska sekmenin stack'indeki ekrani o sekmede acar. React Navigation 7'de
// ic ice ekrana adiyla navigate() yalniz ayni stack'te calisir; tasarimda
// sekmesi belli olan ekranlar (Yol Haritasi, Program, Aylik Plan -> PROGRAM)
// bu yolla acilir. initial:false -> geri, sekmenin kokune doner.
export function openInTab(navigation, tab, screen, params) {
  navigation.navigate(tab, { screen, params, initial: false });
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
