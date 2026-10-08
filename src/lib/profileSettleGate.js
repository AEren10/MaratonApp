// Giris yapan kullanicinin profili okunmadan kurulum/ana yigin secilmesin.
//
// Yeni cihazda giris yapan donen kullanicinin yerel sinav ayari yok; profil
// gelene kadar examType null ve AppNavigator kurulum yiginini Sinav Sec'le
// aciyordu. Profil gelince ya Ana Sayfa'ya ziplaniyor ya da (kurulumu yarim)
// kullanici Kurulum Yarim yerine bastan Sinav Sec'te kaliyordu, cunku yiginin
// ilk ekrani yalniz mount aninda okunuyor.
//
// Yerel sinav ayari sunucu okumasinin yerine gecmez: eski cihaz verisiyle
// yanlis yigina girmektense okuma hatasi acikca gosterilir ve tekrar denenir.
export function isProfileSettling({ userId, profileReadyFor, profileLoadErrorFor }) {
  if (!userId) return false;
  if (profileReadyFor === userId) return false;
  return profileLoadErrorFor !== userId;
}
