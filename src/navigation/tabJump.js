// Baska sekmenin stack'indeki ekrani o sekmede acar. React Navigation 7'de
// ic ice ekrana adiyla navigate() yalniz ayni stack'te calisir; tasarimda
// sekmesi belli olan ekranlar (Yol Haritasi, Program, Aylik Plan -> PROGRAM)
// bu yolla acilir. initial:false -> geri, sekmenin kokune doner.
export function openInTab(navigation, tab, screen, params) {
  navigation.navigate(tab, { screen, params, initial: false });
}
