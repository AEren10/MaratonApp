// Oturumdaki kullanicinin profil fotografi -- tek kaynak.
// Eskiden her ekran kendi yoldan okuyordu: Ayarlar auth metadata'ya
// bakiyordu (oraya hic yazilmiyor), Ana sayfa yalniz bas harf gosteriyordu.
// Yukleme buraya yazar, butun ekranlar buradan okur. Kullanici degisince
// deger otomatik gecersiz olur (kayit kullanici kimligine bagli).
let state = { userId: null, url: null, loaded: false };
const listeners = new Set();

function emit() { listeners.forEach((l) => l()); }

export function subscribeMyAvatar(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMyAvatar() { return state; }

export function setMyAvatar(userId, url) {
  if (!userId) return;
  state = { userId, url: url || null, loaded: true };
  emit();
}

export function isMyAvatarLoaded(userId) {
  return state.loaded && state.userId === userId;
}
