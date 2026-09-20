import { useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";

import { useExam } from "../contexts/ExamContext";
import { SCREENS } from "../constants/screens";
import { resetToTabStackScreen } from "../navigation/rootStackActions";
import { TAB_KEYS } from "../navigation/tabAssignment";
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

  const complete = useCallback(async (summary = {}, options = {}) => {
    track(EVENTS.ONBOARDING_COMPLETE, summary);
    await completeOnboarding();
    // Kurulumdan cikan kullanici ANA SAYFA'ya iner, Rota Detay'a degil.
    // Rota Detay ilk gun bos gorunuyor (hicbir deneme, hicbir tamamlanmis
    // durak yok); ana sayfada ise selamlama, bugunun duragi ve rota cizgisi
    // var. Ilk izlenim orasi olmali. ROTA sekmesinin koku zaten Ana Sayfa,
    // o yuzden ekran adi VERMIYORUZ.
    resetToTabStackScreen(navigation, TAB_KEYS.ROTA, options.screen, undefined, options.then);
  }, [completeOnboarding, navigation]);

  const finish = useCallback(async (summary = {}, options = {}) => {
    if (await permissionNotAsked()) {
      navigation.navigate(SCREENS.NOTIFICATION_PERMISSION, { onboardingSummary: summary, onboardingOptions: options });
      return;
    }
    await complete(summary, options);
  }, [complete, navigation]);

  return { finish, complete };
}
