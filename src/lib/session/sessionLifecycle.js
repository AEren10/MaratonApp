import { signOut as supaSignOut, deleteAccount as supaDeleteAccount } from "../../supabase/auth";
import { unregisterPushToken } from "../../supabase/profiles";
import { cancelAllScheduled } from "../notifications";
import { resetLocalSession } from "./resetLocalSession";
import { isUserSwitch } from "./sessionReset";

// OTURUMUN SONU -- AuthContext'in cagirdigi uc yol burada toplanir ki
// context yalniz durum tutsun.

// Oturum logout() DISINDAN degisirse (refresh token iptal -> SIGNED_OUT,
// girisliyken baska hesabin sifre linki acildi -> A'dan B'ye) eski
// kullanicinin Redux/bildirim/yerel verisi de gitmeli. Eskiden yalniz
// logout() temizliyordu; bu yollarda A'nin verisi B'nin ekranina dusuyordu.
// isBusy: logout/silme suruyorsa temizligi onlar yapar, burada tekrar yok.
export function createUserTracker(isBusy = () => false) {
  let last = null;
  return {
    observe(nextUserId) {
      const prev = last;
      last = nextUserId ?? null;
      if (!isBusy() && isUserSwitch(prev, last)) {
        resetLocalSession({ keepUserId: last }).catch(() => {});
      }
    },
    forget() { last = null; },
  };
}

// Cikis. Bildirim temizligi oturum kapanmadan ONCE: push token'i silmek icin
// hala yetkimiz var. Eskiden cikista hic temizlik yoktu: cihaz cikmis
// kullanicinin hatirlatmalarini atmaya devam ediyor, ikinci kullanici
// girince token iki profilde birden duruyordu.
export async function signOutUser(userId) {
  await cancelAllScheduled().catch(() => {});
  if (userId) await unregisterPushToken(userId).catch(() => {});
  try { await supaSignOut(); } catch (_) {}
}

// Hesap silme. Silme BASARISIZ olursa kullanici girisli kalir: hatirlatmalari
// ve push token'i yerinde durur (eskiden once bunlar siliniyordu). Basarida
// push token profiles satiriyla birlikte (CASCADE) gider; yerel temizligi
// cagiran resetLocalSession ile yapar.
export async function deleteUserAccount() {
  const result = await supaDeleteAccount();
  await supaSignOut().catch(() => {});
  return result || { storageFailures: [] };
}
