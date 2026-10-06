// AppNavigator'in hangi yigini gosterecegi. Sira bilerek boyle:
// kurtarma > karsilama > giris > (profil bekleniyor) > kurulum > uygulama.
export const ROOT_GATE = Object.freeze({
  RECOVERY: "recovery",
  SLIDES: "slides",
  AUTH: "auth",
  PROFILE_ERROR: "profile_error",
  PROFILE_LOADING: "profile_loading",
  SETUP: "setup",
  APP: "app",
});

// onboardingDone zaten "sinav secili VE (kurulum bitti YA DA atlandi)".
// Eskiden ayrica setupSkipped'e bakiliyordu: bellekte kalan bir atlama
// bayragi sinav tipi OLMAYAN kullaniciyi uygulamaya sokabiliyordu.
export function resolveRootGate({
  recoveryMode = false,
  hasSeenSlides = false,
  hasSession = false,
  onboardingDone = false,
  profileSettling = false,
  profileLoadFailed = false,
} = {}) {
  if (recoveryMode) return ROOT_GATE.RECOVERY;
  if (!hasSeenSlides) return ROOT_GATE.SLIDES;
  if (!hasSession) return ROOT_GATE.AUTH;
  if (profileSettling) return ROOT_GATE.PROFILE_LOADING;
  if (profileLoadFailed) return onboardingDone ? ROOT_GATE.APP : ROOT_GATE.PROFILE_ERROR;
  if (onboardingDone) return ROOT_GATE.APP;
  return ROOT_GATE.SETUP;
}
