import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { getAuthProviders, revokeAppleToken } from "../supabase/auth";

// Hesap silinirken Apple baglantisini da iptal eder (App Store 5.1.1(v)).
// Apple iptal icin taze bir authorizationCode ister; bu yuzden Apple ile
// giris yapmis kullaniciya silmeden once Apple onay penceresi bir kez acilir.
// En iyi caba: kullanici pencereyi kapatirsa ya da ag hatasi olursa silme
// yine devam eder (hesabini silememesi daha kotu).
export async function revokeAppleLinkIfNeeded() {
  if (Platform.OS !== "ios") return false;
  try {
    const providers = await getAuthProviders();
    if (!providers.includes("apple")) return false;
    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
    if (!credential?.authorizationCode) return false;
    return await revokeAppleToken(credential.authorizationCode);
  } catch (_) {
    return false;
  }
}
