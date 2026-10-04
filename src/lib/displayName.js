// Kullanicinin gorunen adi. Tek kaynak — onceden useHomeDashboard icinde
// satir arasinda duruyordu ve baska ekranlar bulamayip "adsiz" metne dusuyordu.
//
// Ad auth user_metadata'sinda tutuluyor (profiles.name kolonu da var ama
// mevcut kod yolu metadata'yi kullaniyor; ikisi ayrismasin diye buradan okunur).
export function displayNameOf(user) {
  const email = user?.email || "";
  // Apple "e-postami gizle" adresi (x7k2...@privaterelay.appleid.com) ad degil.
  const local = email.endsWith("privaterelay.appleid.com") ? null : email.split("@")[0];
  return user?.user_metadata?.name || local || "Öğrenci";
}

// Yalnizca ilk ad — tasarimda selamlama tek kelime kullaniyor ("HOS GELDIN ARDA").
export function firstNameOf(user) {
  const full = displayNameOf(user);
  return full.trim().split(/\s+/)[0] || full;
}
