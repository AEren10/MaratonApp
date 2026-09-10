import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { useC } from "../../contexts/ThemeContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import { useTrialEntryForm } from "./useTrialEntryForm";
import { TrialEntryFormContent } from "./components/TrialEntryFormContent";
import { makeTrialEntryStyles } from "./trialEntryStyles";

export default function TrialEntryScreen() {
  const navigation = useNavigation();
  const C = useC();
  const styles = useMemo(() => makeTrialEntryStyles(C), [C]);
  const {
    accessError, accessLoading, checkFeature, refreshUsage, showPaywall,
  } = usePremium();
  const showAlert = useAlert();
  const trialEntry = useTrialEntryForm({ C, navigation });
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!trialEntry.isDirty || trialEntry.saving) return;
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
  }, [navigation, showAlert, trialEntry]);

  if (accessLoading) {
    return <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.center}><ActivityIndicator size="large" color={C.accent} /></View>
    </SafeAreaView>;
  }

  if (accessError) {
    return <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.center}>
        <EmptyState icon="refresh" title="Deneme hakkın doğrulanamadı"
          message="Bağlantını kontrol edip yeniden deneyebilirsin. Henüz kotandan kullanım düşülmedi."
          actionLabel="Tekrar dene" onAction={refreshUsage} />
      </View>
    </SafeAreaView>;
  }

  if (!checkFeature("unlimited_trials")) {
    return <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.center}>
        <EmptyState icon="lock" title="Bu ayki 4 denemeni girdin"
          message="Yeni kota gelecek ay Türkiye saatine göre yenilenir. Pro ile sınırsız devam edebilirsin."
          actionLabel="Pro'yu incele" onAction={() => showPaywall("trial_entry_limit")} />
      </View>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Deneme Gir</Text>
          <View style={styles.headerSpacer} />
        </View>
        <TrialEntryFormContent C={C} form={trialEntry} styles={styles} />
        <XPBoostToast amount={trialEntry.xpToast.amount} visible={trialEntry.xpToast.visible}
          multiplier={trialEntry.xpToast.multiplier} onDismiss={trialEntry.dismissXP} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
