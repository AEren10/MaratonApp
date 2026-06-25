import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../contexts/AuthContext";
import { SCREENS } from "../constants/screens";
import { STORAGE_KEYS } from "../constants/storageKeys";

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
  try {
    await AsyncStorage.setItem(PENDING_KEY, code.toUpperCase());
  } catch {}
}

export async function consumePendingReferral() {
  try {
    const code = await AsyncStorage.getItem(PENDING_KEY);
    if (code) await AsyncStorage.removeItem(PENDING_KEY);
    return code || null;
  } catch {
    return null;
  }
}

async function savePendingDeepLink(parsed) {
  try {
    if (parsed.type === "referral") await savePendingReferral(parsed.code);
    else if (parsed.type === "friend") await AsyncStorage.setItem(PENDING_FRIEND_KEY, parsed.code);
    else if (parsed.type === "group") await AsyncStorage.setItem(PENDING_GROUP_KEY, parsed.code);
  } catch {}
}

function routeDeepLink(parsed, session, navigation) {
  if (!parsed) return;
  if (!session) {
    savePendingDeepLink(parsed);
    return;
  }
  if (parsed.type === "referral") {
    navigation.navigate(SCREENS.REFERRAL, { code: parsed.code });
  } else if (parsed.type === "friend") {
    navigation.navigate(SCREENS.FRIENDS, { friendCode: parsed.code });
  } else if (parsed.type === "group") {
    navigation.navigate(SCREENS.LEAGUE, { groupCode: parsed.code });
  }
}

export async function consumePendingFriendCode() {
  try {
    const code = await AsyncStorage.getItem(PENDING_FRIEND_KEY);
    if (code) await AsyncStorage.removeItem(PENDING_FRIEND_KEY);
    return code || null;
  } catch { return null; }
}

export async function consumePendingGroupCode() {
  try {
    const code = await AsyncStorage.getItem(PENDING_GROUP_KEY);
    if (code) await AsyncStorage.removeItem(PENDING_GROUP_KEY);
    return code || null;
  } catch { return null; }
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
      const [friendCode, groupCode] = await Promise.all([
        consumePendingFriendCode(),
        consumePendingGroupCode(),
      ]);
      if (friendCode) navigation.navigate(SCREENS.FRIENDS, { friendCode });
      else if (groupCode) navigation.navigate(SCREENS.LEAGUE, { groupCode });
    })().catch(() => {});
  }, [session]);

  useEffect(() => {
    async function handleInitialURL() {
      const url = await Linking.getInitialURL();
      if (!url || url === lastUrl.current) return;
      lastUrl.current = url;
      routeDeepLink(parseDeepLink(url), session, navigation);
    }
    handleInitialURL();
  }, [session]);

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (!url) return;
      lastUrl.current = url;
      routeDeepLink(parseDeepLink(url), session, navigation);
    });
    return () => sub.remove();
  }, [session, navigation]);
}
