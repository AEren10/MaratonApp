import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useSubscription } from "../../hooks/useSubscription";
import { SettingsGroup } from "../settings/components/SettingsGroup";
import { SettingsRow } from "../settings/components/SettingsRow";
import { useSettingsActions } from "../settings/useSettingsActions";
import { SubscriptionStatusCard } from "./components/SubscriptionStatusCard";
import * as H from "../../lib/haptics";

// Tasarim: "Abonelik ve hesap". Ayarlar > Abonelik satirindan aciliyor.
// Fatura gecmisi bolumu cizilmiyor (tutar hicbir kaynakta yok, bkz.
// useSubscription). Iptal ayri bir onay ekraninda.
export default function SubscriptionScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { state, info, isPremium, reload, openStore } = useSubscription();
  const { handleLogout, handleDeleteAccount } = useSettingsActions();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goCancel = useCallback(() => {
    H.tap();
    navigation.navigate(SCREENS.SUBSCRIPTION_CANCEL);
  }, [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Abonelik ve hesap</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {state === "loading" ? (
          <View style={styles.gutter}>
            <Skeleton height={140} radius={SHAPE.sheet} />
          </View>
        ) : null}

        {state === "error" ? (
          <ErrorState
            preset="server"
            onPrimary={reload}
            onSecondary={goBack}
            style={styles.gutter}
          />
        ) : null}

        {state === "ready" && isPremium ? (
          <Animated.View entering={FadeInDown.duration(420)} style={styles.gutter}>
            <SubscriptionStatusCard
              periodLabel={info?.periodLabel}
              renewsLine={info?.renewsLine}
              onManage={openStore}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <SettingsGroup title="HESAP">
            <SettingsRow first label="Çıkış yap" danger onPress={handleLogout} />
            <SettingsRow label="Hesabımı sil" danger onPress={handleDeleteAccount} />
          </SettingsGroup>
          <Text style={[TYPOGRAPHY.meta, styles.note, { color: C.text3 }]}>
            Hesap silme 30 gün içinde tüm veriyi kaldırır. Aboneliğin varsa mağazadan
            ayrıca iptal etmen gerekir.
          </Text>
        </Animated.View>

        {/* Iptal satiri yalniz bitis tarihi GERCEKTEN biliniyorsa cikiyor:
            onay ekraninin cumlesi "Premium 14 Eylul'e kadar acik" tarihe
            dayaniyor, tarihsiz o ekran dogru sey soyleyemez. */}
        {state === "ready" && isPremium && info?.endsAt && info?.willRenew ? (
          <Animated.View entering={FadeInDown.delay(160).duration(420)} style={styles.gutter}>
            <Pressable
              onPress={goCancel}
              accessibilityRole="button"
              accessibilityLabel="Aboneliği iptal et"
              style={({ pressed }) => [styles.cancelRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.accentBright, flex: 1 }]}>
                Aboneliği iptal et
              </Text>
              <Icon name="chevR" size={13} color={C.accent} />
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
  },
  scroll: { paddingTop: STEP.s2, paddingBottom: STEP.s5 },
  gutter: { paddingHorizontal: GUTTER, marginTop: STEP.s2 },
  note: { paddingHorizontal: GUTTER, marginTop: STEP.s2, lineHeight: 20 },
  cancelRow: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    minHeight: CONTROL.tapMin, marginTop: STEP.s3,
  },
});
