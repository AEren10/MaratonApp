import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { track, trackPaywallViewed } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { Icon, AnimatedPressable, Button } from "../../components/design";
import { PaywallContextBlock } from "./components/PaywallContextBlock";
import { paywallContextFor, PAYWALL_FOOTNOTE } from "../../constants/paywallContexts";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { PLANS, PREMIUM_FEATURE_LIST } from "../../constants/premium";
import { SCREENS } from "../../constants/screens";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isInitialized,
  getPurchasesStatus,
} from "../../lib/purchases";
import { startTrial } from "../../supabase/profiles";
import { useAuth } from "../../contexts/AuthContext";
import PlanCard from "./components/PlanCard";
import FeatureRow from "./components/FeatureRow";
import * as H from "../../lib/haptics";
import { usePaywallPurchase } from "../../hooks/usePaywallPurchase";

export default function PaywallScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(C), [C]);

  // Satin alma, geri yukleme ve olcum mantigi hook'ta (AGENTS.md:
  // is mantigi ekran dosyasinda durmaz).
  const {
    selectedPlan, setSelectedPlan, purchasing, displayPlans,
    handlePurchase, handleRestore, source,
  } = usePaywallPurchase();

  // Tasarim tek bir paywall degil, GELDIGIN ISE gore degisen bir ekran.
  // Karsiligi olmayan kaynak null doner ve genel Premium icerigi
  // gosterilir -- yanlis baglam gostermektense baglamsiz gostermek dogru.
  const context = paywallContextFor(source);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Pressable style={s.closeBtn} onPress={() => { H.tap(); navigation.goBack(); }} hitSlop={12}>
        <Icon name="x" size={22} color={C.sec} />
      </Pressable>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {context ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <PaywallContextBlock C={C} context={context} />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(500)} style={s.heroWrap}>
              <View style={s.crownWrap}>
                <Icon name="crown" size={40} color={C.accent} fill={C.accent} />
              </View>
              <Text style={s.heroTitle}>Maraton Pro</Text>
              <Text style={s.heroSub}>Sınırsız eriş, tam performans</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(120)} style={s.featuresWrap}>
              {PREMIUM_FEATURE_LIST.map((f, i) => (
                <FeatureRow key={f.key} title={f.title} index={i} />
              ))}
            </Animated.View>
          </>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(240)} style={s.plansWrap}>
          {displayPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => { H.select(); setSelectedPlan(plan.id); }}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(360)}>
          <Button
            onPress={handlePurchase}
            loading={purchasing}
            size="lg"
            fullWidth
            style={{ ...SHADOWS.fab }}
          >
            {context?.primary || "Hemen Başla"}
          </Button>
          <Text style={s.socialProof}>{PAYWALL_FOOTNOTE}</Text>
          <Pressable onPress={handleRestore} style={s.restoreBtn}>
            <Text style={[s.restoreText, { color: C.accent }]}>Satın almayı geri yükle</Text>
          </Pressable>
          <View style={s.linksRow}>
            <Pressable onPress={() => navigation.navigate(SCREENS.PRIVACY)}>
              <Text style={s.linkText}>Gizlilik Politikası</Text>
            </Pressable>
            <Text style={s.linkDot}>·</Text>
            <Pressable onPress={() => navigation.navigate(SCREENS.TERMS)}>
              <Text style={s.linkText}>Kullanım Şartları</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: insets.bottom + SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    closeBtn: {
      position: "absolute", top: 52, right: SPACING.lg,
      zIndex: 10, width: 36, height: 36, borderRadius: RADIUS.full,
      backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
    },
    scroll: { paddingHorizontal: SPACING.xl },
    heroWrap: { alignItems: "center", paddingTop: SPACING.huge, paddingBottom: SPACING.xxl },
    crownWrap: {
      width: 72, height: 72, borderRadius: RADIUS.full,
      backgroundColor: C.accent + "1A", alignItems: "center", justifyContent: "center",
      marginBottom: SPACING.md,
    },
    heroTitle: { ...TYPOGRAPHY.display, color: C.text, marginBottom: SPACING.xs },
    heroSub: { ...TYPOGRAPHY.body, color: C.sec },
    featuresWrap: { marginBottom: SPACING.xxl },
    plansWrap: { gap: SPACING.md, marginBottom: SPACING.xxl },
    socialProof: {
      ...TYPOGRAPHY.caption, color: C.green, textAlign: "center",
      marginTop: SPACING.md,
    },
    linksRow: {
      flexDirection: "row", justifyContent: "center", alignItems: "center",
      gap: SPACING.sm, marginTop: SPACING.sm,
    },
    restoreBtn: { alignItems: "center", paddingVertical: SPACING.sm, marginTop: SPACING.xs },
    restoreText: { ...TYPOGRAPHY.captionMedium, textDecorationLine: "underline" },
    linkText: { ...TYPOGRAPHY.caption, color: C.sec, textDecorationLine: "underline" },
    linkDot: { ...TYPOGRAPHY.caption, color: C.muted },
  });
}
