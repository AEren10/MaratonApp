import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { PLANS, PREMIUM_FEATURE_LIST } from "../../constants/premium";
import { SCREENS } from "../../constants/screens";
import PlanCard from "./components/PlanCard";
import FeatureRow from "./components/FeatureRow";
import * as H from "../../lib/haptics";

export default function PaywallScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const s = useMemo(() => makeStyles(C), [C]);

  const handlePurchase = () => {
    H.medium();
    // RevenueCat integration placeholder
    // When API key is available:
    // await Purchases.purchasePackage(selectedPackage);
    if (__DEV__) console.warn("[Premium] RevenueCat not configured yet. Plan:", selectedPlan);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Pressable style={s.closeBtn} onPress={() => { H.tap(); navigation.goBack(); }} hitSlop={12}>
        <Icon name="x" size={22} color={C.sec} />
      </Pressable>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={s.heroWrap}>
          <LinearGradient
            colors={[C.accent + "22", C.accent + "12", "transparent"]}
            style={s.heroBg}
          />
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

        <Animated.View entering={FadeInDown.duration(500).delay(240)} style={s.plansWrap}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => { H.select(); setSelectedPlan(plan.id); }}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(360)}>
          <Pressable style={[s.ctaBtn, { backgroundColor: C.accent, shadowColor: C.accent }]} onPress={handlePurchase}>
            <Text style={s.ctaText}>Hemen Başla</Text>
          </Pressable>
          <Text style={s.socialProof}>Bu hafta 1.200+ öğrenci Pro'ya geçti</Text>
          <Text style={s.cancelText}>İstediğin zaman iptal edebilirsin</Text>
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
    heroBg: {
      position: "absolute", top: 0, left: -SPACING.xl, right: -SPACING.xl,
      height: 200, borderRadius: RADIUS.xxl,
    },
    crownWrap: {
      width: 72, height: 72, borderRadius: RADIUS.full,
      backgroundColor: C.accent + "1A", alignItems: "center", justifyContent: "center",
      marginBottom: SPACING.md,
    },
    heroTitle: { ...TYPOGRAPHY.display, color: C.text, marginBottom: SPACING.xs },
    heroSub: { ...TYPOGRAPHY.body, color: C.sec },
    featuresWrap: { marginBottom: SPACING.xxl },
    plansWrap: { gap: SPACING.md, marginBottom: SPACING.xxl },
    ctaBtn: {
      borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
      alignItems: "center",
      ...SHADOWS.fab,
    },
    ctaText: { ...TYPOGRAPHY.button, color: "#FFFFFF", fontSize: 17 },
    socialProof: {
      ...TYPOGRAPHY.caption, color: C.green, textAlign: "center",
      marginTop: SPACING.md,
    },
    cancelText: {
      ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center",
      marginTop: SPACING.xs,
    },
    linksRow: {
      flexDirection: "row", justifyContent: "center", alignItems: "center",
      gap: SPACING.sm, marginTop: SPACING.sm,
    },
    linkText: { ...TYPOGRAPHY.caption, color: C.sec, textDecorationLine: "underline" },
    linkDot: { ...TYPOGRAPHY.caption, color: C.muted },
  });
}
