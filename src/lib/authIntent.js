// Karsilama ekranindaki iki aksiyonu ayirmak icin tasinan niyet.
//
// AppNavigator hasSeenSlides degisince TUM yigini degistiriyor, yani Karsilama
// unmount oluyor ve oradan navigate edilemiyor. Niyet burada tutulup AuthStack
// mount olurken initialRouteName olarak okunuyor.
//
// Modul seviyesinde tutuluyor cunku render tetiklemesi gerekmiyor: niyeti
// yazan aksiyon zaten context guncellemesiyle yeniden render baslatiyor.

let intent = null;

export function setAuthIntent(next) {
  intent = next === "register" || next === "login" ? next : null;
}

export function consumeAuthIntent() {
  const value = intent;
  intent = null;
  return value;
}
