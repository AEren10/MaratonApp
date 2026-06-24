import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../contexts/AuthContext";
import { SCREENS } from "../constants/screens";
import { STORAGE_KEYS } from "../constants/storageKeys";

const PENDING_KEY = STORAGE_KEYS.PENDING_REFERRAL;

function extractReferralCode(url) {
  if (!url) return null;
  const parsed = Linking.parse(url);
  if (parsed.path?.startsWith("referral/")) {
    return parsed.path.replace("referral/", "").toUpperCase() || null;
  }
  if (parsed.queryParams?.code) {
    return parsed.queryParams.code.toUpperCase();
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

export function useDeepLink() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const handled = useRef(new Set());

  useEffect(() => {
    async function handleInitialURL() {
      const url = await Linking.getInitialURL();
      if (!url || handled.current.has(url)) return;
      handled.current.add(url);
      const code = extractReferralCode(url);
      if (!code) return;

      if (session) {
        navigation.navigate(SCREENS.REFERRAL, { code });
      } else {
        await savePendingReferral(code);
      }
    }
    handleInitialURL();
  }, [session]);

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (!url || handled.current.has(url)) return;
      handled.current.add(url);
      const code = extractReferralCode(url);
      if (!code) return;

      if (session) {
        navigation.navigate(SCREENS.REFERRAL, { code });
      } else {
        savePendingReferral(code);
      }
    });
    return () => sub.remove();
  }, [session, navigation]);
}
