// Kayit sonrasi ne olacak?
//
// E-posta dogrulamasi KAPALIYKEN (canli ayar, 2026-09-30) signUp oturum
// dondurur; AppNavigator kurulum yiginina gecer, ekranin bir sey yapmasi
// gerekmez. Dogrulama ACILIRSA oturum gelmez: eskiden kullanici Kayit
// ekraninda "hos geldin" uyarisiyla kaliyordu, sonraki adim yoktu.
export const SIGN_UP_OUTCOME = Object.freeze({
  SIGNED_IN: "signed_in",
  CONFIRM_EMAIL: "confirm_email",
});

export function signUpOutcome(data) {
  return data?.session ? SIGN_UP_OUTCOME.SIGNED_IN : SIGN_UP_OUTCOME.CONFIRM_EMAIL;
}
