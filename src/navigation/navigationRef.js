import { createNavigationContainerRef } from "@react-navigation/native";

// NavigationContainer disindaki global yuzeyler (OfflineBanner) icin tek ref.
export const navigationRef = createNavigationContainerRef();

// NavigationContainer mount olmadan navigationRef.addListener cagirmak
// "The 'navigation' object hasn't been initialized yet" hatasini firlatiyor:
// global yuzeyler (OfflineBanner) navigator'dan ONCE render oluyor. Hazir
// olma anini burada yayinliyoruz ki dinleyiciler dogru anda baglansin.
const readyListeners = new Set();
let navigationReady = false;

export function isNavigationReady() {
  return navigationReady;
}

export function markNavigationReady() {
  navigationReady = true;
  for (const cb of readyListeners) cb();
}

// Zaten hazirsa geri cagri HEMEN calisir — dinleyici gec baglanirsa olayi
// kacirmasin. Donen fonksiyon aboneligi kaldirir.
export function onNavigationReady(cb) {
  if (navigationReady) cb();
  else readyListeners.add(cb);
  return () => readyListeners.delete(cb);
}

export function navigateFromOutside(name, params) {
  if (!navigationRef.isReady()) return false;
  const names = navigationRef.getRootState()?.routeNames || [];
  if (!names.includes(name)) return false;
  navigationRef.navigate(name, params);
  return true;
}
