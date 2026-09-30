// Kurulum bittikten sonra inilecek yer.
//
// completeOnboarding bayragi dustugu anda AppNavigator kurulum yiginini
// (SetupStack) kaldirip AppStackInner'i yeni bir navigator olarak kuruyor.
// Kurulum ekraninin navigation nesnesiyle yapilan reset o anda OLU bir
// navigator'a gidiyordu: "Ilk duraga basla" kullaniciyi zamanlayiciya degil
// Ana Sayfa'ya birakiyordu. Hedef burada tutulup yeni yigin kurulurken
// okunuyor (authIntent ile ayni desen).

let pending = null;

// Yigin degisimi ayni saniyede oluyor. Eski bir hedef (degisim bir sebeple
// olmadiysa) sonraki bir acilista kullaniciyi zamanlayiciya atmasin.
export const LANDING_MAX_AGE_MS = 15000;

export function setPostSetupLanding(landing, now = Date.now()) {
  pending = landing && landing.tab ? { ...landing, at: now } : null;
}

export function consumePostSetupLanding(now = Date.now()) {
  const value = pending;
  pending = null;
  if (!value || now - value.at > LANDING_MAX_AGE_MS) return null;
  const { at, ...landing } = value;
  return landing;
}

// Kurulum yigini kalkacak mi? Kalkacaksa hedef bekletilir, kalkmayacaksa
// (kurulumu atlamis kullanici Profil'den tamamliyor) dogrudan reset yapilir.
export function landingDeferredToNewStack({ onboardingDone }) {
  return !onboardingDone;
}
