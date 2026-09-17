import { useCallback, useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { ErrorState } from "../../components/design";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { useC } from "../../contexts/ThemeContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import { useTrialEntryForm } from "./useTrialEntryForm";
import { useTrialEntrySteps } from "./useTrialEntrySteps";
import { useTrialQuotaGate } from "./useTrialQuotaGate";
import { useLockedFeatureEntry } from "../../hooks/useLockedFeatureEntry";
import { TrialEntryFormContent } from "./components/TrialEntryFormContent";
import { TrialQuotaSheet } from "./components/TrialQuotaSheet";
import { TrialEntrySkeleton } from "./components/TrialEntrySkeleton";
import { makeTrialEntryStyles } from "./trialEntryStyles";

export default function TrialEntryScreen() {
  const navigation = useNavigation();
  const C = useC();
  const styles = useMemo(() => makeTrialEntryStyles(C), [C]);
  const { refreshUsage } = usePremium();
  const enterLocked = useLockedFeatureEntry();
  const quotaGate = useTrialQuotaGate();
  const showAlert = useAlert();
  const trialEntry = useTrialEntryForm({ C, navigation });
  const exitScreen = useCallback(() => navigation.goBack(), [navigation]);
  const steps = useTrialEntrySteps({ form: trialEntry, onExit: exitScreen });
  const quotaBlocked = quotaGate.blocked;

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (e.data.action.type === "REPLACE") return;
      if (quotaBlocked || !trialEntry.isDirty || trialEntry.saving) return;
      e.preventDefault();
      showAlert(
        "Deneme kaydedilmedi",
        "Girdiklerin taslak olarak saklanacak, dilediğin zaman kaldığın yerden devam edebilirsin.",
        [
          { text: "Düzenlemeye devam et", style: "cancel" },
          {
            text: "Taslağı sil ve çık",
            style: "destructive",
            onPress: () => {
              trialEntry.clearDraft();
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: "Taslak olarak çık",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, quotaBlocked, showAlert, trialEntry]);

  if (quotaGate.loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <TrialEntrySkeleton />
      </SafeAreaView>
    );
  }

  if (quotaGate.error) {
    return <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.center}>
        <ErrorState title="Deneme hakkın doğrulanamadı"
          body="Bağlantını kontrol edip yeniden deneyebilirsin. Henüz kotandan kullanım düşülmedi."
          primary="Tekrar dene" onPrimary={refreshUsage} />
      </View>
    </SafeAreaView>;
  }

  if (quotaGate.blocked && quotaGate.sheet) {
    return <SafeAreaView edges={["top"]} style={styles.safe}>
      <TrialQuotaSheet sheet={quotaGate.sheet} onClose={exitScreen}
        onPro={() => enterLocked("trial_entry_limit")} />
    </SafeAreaView>;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.safe}>
        <TrialEntryFormContent form={trialEntry} styles={styles}
          step={steps.step} totalSteps={steps.totalSteps}
          goNext={steps.goNext} goBack={steps.goBack} overflow={steps.overflow} />
        <XPBoostToast amount={trialEntry.xpToast.amount} visible={trialEntry.xpToast.visible}
          multiplier={trialEntry.xpToast.multiplier} onDismiss={trialEntry.dismissXP} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
