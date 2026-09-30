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
import { landingDeferredToNewStack, setPostSetupLanding } from "../lib/postSetupLanding";

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
  const { completeOnboarding, onboardingDone } = useExam();

  const complete = useCallback(async (summary = {}, options = {}) => {
    track(EVENTS.ONBOARDING_COMPLETE, summary);
    // Kurulumdan cikan kullanici ANA SAYFA'ya iner, Rota Detay'a degil.
    // Rota Detay ilk gun bos gorunuyor (hicbir deneme, hicbir tamamlanmis
    // durak yok); ana sayfada ise selamlama, bugunun duragi ve rota cizgisi
    // var. Ilk izlenim orasi olmali. ROTA sekmesinin koku zaten Ana Sayfa,
    // o yuzden ekran adi VERMIYORUZ.
    const landing = { tab: TAB_KEYS.ROTA, screen: options.screen, then: options.then };
    if (landingDeferredToNewStack({ onboardingDone })) {
      // Bayrak dusunce bu yigin kalkiyor; hedefi yeni yigin uygular.
      setPostSetupLanding(landing);
      await completeOnboarding();
      return;
    }
    await completeOnboarding();
    resetToTabStackScreen(navigation, landing.tab, landing.screen, undefined, landing.then);
  }, [completeOnboarding, navigation, onboardingDone]);

  const finish = useCallback(async (summary = {}, options = {}) => {
    if (await permissionNotAsked()) {
      navigation.navigate(SCREENS.NOTIFICATION_PERMISSION, { onboardingSummary: summary, onboardingOptions: options });
      return;
    }
    await complete(summary, options);
  }, [complete, navigation]);

  return { finish, complete };
}
