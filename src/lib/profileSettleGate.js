// Giris yapan kullanicinin profili okunmadan kurulum/ana yigin secilmesin.
//
// Yeni cihazda giris yapan donen kullanicinin yerel sinav ayari yok; profil
// gelene kadar examType null ve AppNavigator kurulum yiginini Sinav Sec'le
// aciyordu. Profil gelince ya Ana Sayfa'ya ziplaniyor ya da (kurulumu yarim)
// kullanici Kurulum Yarim yerine bastan Sinav Sec'te kaliyordu, cunku yiginin
// ilk ekrani yalniz mount aninda okunuyor.
//
// Yerelde sinav ayari varsa beklenmez (cevrimdisi acilis aninda calisir).
// Ag asiri yavassa kapi sure dolunca acilir: kimse yukleme ekraninda kalmaz.
export const PROFILE_SETTLE_MAX_MS = 4000;

export function isProfileSettling({ userId, profileReadyFor, examType, expiredFor }) {
  if (!userId || examType) return false;
  if (profileReadyFor === userId) return false;
  return expiredFor !== userId;
}
