import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { useAuth } from "../contexts/AuthContext";
import { SCREENS } from "../constants/screens";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getString, remove, setString } from "../lib/storage/appStorage";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";

const PENDING_KEY = STORAGE_KEYS.PENDING_REFERRAL;
const PENDING_FRIEND_KEY = STORAGE_KEYS.PENDING_FRIEND_CODE;
const PENDING_GROUP_KEY = STORAGE_KEYS.PENDING_GROUP_CODE;

function parseDeepLink(url) {
  if (!url) return null;
  const parsed = Linking.parse(url);
  const path = parsed.path || "";
  if (path.startsWith("referral/")) {
    const code = path.replace("referral/", "").toUpperCase();
    return code ? { type: "referral", code } : null;
  }
  if (path.startsWith("friend/")) {
    const code = path.replace("friend/", "").toUpperCase();
    return code ? { type: "friend", code } : null;
  }
  if (path.startsWith("group/")) {
    const code = path.replace("group/", "").toUpperCase();
    return code ? { type: "group", code } : null;
  }
  if (parsed.queryParams?.code) {
    return { type: "referral", code: parsed.queryParams.code.toUpperCase() };
  }
  return null;
}

export async function savePendingReferral(code) {
  if (!code) return;
  await setString(PENDING_KEY, code.toUpperCase());
}

export async function consumePendingReferral() {
  const code = await getString(PENDING_KEY);
  if (code) await remove(PENDING_KEY);
  return code || null;
}

async function savePendingDeepLink(parsed) {
  if (parsed.type === "referral") await savePendingReferral(parsed.code);
  else if (parsed.type === "friend") await setString(PENDING_FRIEND_KEY, parsed.code);
  else if (parsed.type === "group") await setString(PENDING_GROUP_KEY, parsed.code);
}

/**
 * Oturum AÇIKKEN yönlendirmeyi burada YAPMIYORUZ.
 *
 * React Navigation'ın linking yapılandırması (navigation/routes.js) aynı
 * URL'i zaten işliyor. İkisi birden navigate ederse iki yönlendirme yarışıyor
 * ve hangisi sonra düşerse o kazanıyordu. Burada yalnızca oturum yokken
 * kodu saklıyoruz; giriş yapıldığında aşağıdaki effect tüketiyor.
 */
function routeDeepLink(parsed, session) {
  if (!parsed) return;
  if (!session) savePendingDeepLink(parsed);
}

export async function consumePendingFriendCode() {
  const code = await getString(PENDING_FRIEND_KEY);
  if (code) await remove(PENDING_FRIEND_KEY);
  return code || null;
}

export async function consumePendingGroupCode() {
  const code = await getString(PENDING_GROUP_KEY);
  if (code) await remove(PENDING_GROUP_KEY);
  return code || null;
}

export function useDeepLink() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const lastUrl = useRef(null);
  const pendingConsumed = useRef(false);

  useEffect(() => {
    if (!session || pendingConsumed.current) return;
    pendingConsumed.current = true;
    (async () => {
      // Referral BURADA EKSİKTİ: davet linkiyle kurulum yapan kullanıcının
      // kodu depoya yazılıyor ama giriş sonrası hiç tüketilmiyordu. Kullanıcı
      // Davet ekranını elle açmadıkça kod orada kalıyor, davet eden kredi
      // alamıyordu — büyüme döngüsünün tam da kurulduğu senaryo çalışmıyordu.
      const [friendCode, groupCode, referralCode] = await Promise.all([
        consumePendingFriendCode(),
        consumePendingGroupCode(),
        getString(PENDING_KEY).catch(() => null),
      ]);
      if (friendCode) navigation.navigate(SCREENS.FRIENDS, { friendCode });
      else if (groupCode) navigation.navigate(SCREENS.LEAGUE, { groupCode });
      else if (referralCode) {
        // remove() ETMİYORUZ: ReferralScreen kodu depodan okuyup alana
        // dolduruyor ve uygulama başarılı olunca temizleniyor. Burada silersek
        // kullanıcı ekranı görmeden kod kaybolur.
        track(EVENTS.REFERRAL_LINK_APPLIED, { source: "deep_link_pending" });
        navigation.navigate(SCREENS.REFERRAL, { code: referralCode });
      }
    })().catch(() => {});
  }, [session]);

  useEffect(() => {
    async function handleInitialURL() {
      const url = await Linking.getInitialURL();
      if (!url || url === lastUrl.current) return;
      lastUrl.current = url;
      routeDeepLink(parseDeepLink(url), session);
    }
    handleInitialURL();
  }, [session]);

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (!url) return;
      lastUrl.current = url;
      routeDeepLink(parseDeepLink(url), session);
    });
    return () => sub.remove();
  }, [session, navigation]);
}
