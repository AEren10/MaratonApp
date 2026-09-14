import { useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";

import { useExam } from "../contexts/ExamContext";
import { SCREENS } from "../constants/screens";
import { ROOT_STACK } from "../navigation/routes";
import { EVENTS } from "../constants/analytics";
import { track } from "../lib/analytics";

async function permissionNotAsked() {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "undetermined";
  } catch {
    return false;
  }
}

// Kurulumun son halkasi. Tasarim zinciri: Rota Hazır -> Bildirim İzni -> rota.
// Izin daha once sorulmadiysa once Bildirim İzni acilir; kurulum orada
// (izin ya da atla) tamamlanir. completeOnboarding kurulum yiginini
// kaldirdigi icin izin ekrani ONCESINDE cagrilmaz.
export function useFinishOnboarding() {
  const navigation = useNavigation();
  const { completeOnboarding } = useExam();

  const complete = useCallback(async (summary = {}) => {
    track(EVENTS.ONBOARDING_COMPLETE, summary);
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: ROOT_STACK.MAIN_TABS, params: { screen: SCREENS.ROADMAP } }],
    });
  }, [completeOnboarding, navigation]);

  const finish = useCallback(async (summary = {}) => {
    if (await permissionNotAsked()) {
      navigation.navigate(SCREENS.NOTIFICATION_PERMISSION, { onboardingSummary: summary });
      return;
    }
    await complete(summary);
  }, [complete, navigation]);

  return { finish, complete };
}
