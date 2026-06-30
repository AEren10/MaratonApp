import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { Icon, AnimatedPressable, Button } from "../../components/design";
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
} from "../../lib/purchases";
import { startTrial } from "../../supabase/profiles";
import { useAuth } from "../../contexts/AuthContext";
import PlanCard from "./components/PlanCard";
import FeatureRow from "./components/FeatureRow";
import * as H from "../../lib/haptics";

export default function PaywallScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { refreshPremium } = usePremium();
  const showAlert = useAlert();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [packages, setPackages] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const s = useMemo(() => makeStyles(C), [C]);

  useEffect(() => {
    if (!isInitialized()) return;
    getOfferings().then((offering) => {
      if (offering?.availablePackages) setPackages(offering.availablePackages);
    });
  }, []);

  const getSelectedPackage = useCallback(() => {
    if (!packages) return null;
    const identifier = selectedPlan === "yearly" ? "$rc_annual" : "$rc_monthly";
    return packages.find((p) => p.identifier === identifier) || packages[0];
  }, [packages, selectedPlan]);

  const handlePurchase = useCallback(async () => {
    H.medium();
    setPurchasing(true);
    try {
      const pkg = getSelectedPackage();
      if (!pkg) {
        if (user?.id) {
          const started = await startTrial(user.id);
          if (started) {
            H.success();
            await refreshPremium();
            showAlert("Deneme Başladı", "7 günlük ücretsiz denemen başladı!");
            navigation.goBack();
            return;
          }
          showAlert("Deneme Kullanıldı", "Ücretsiz deneme hakkını zaten kullandın.");
          return;
        }
        showAlert("Henüz Hazır Değil", "Satın alma şu an kullanılamıyor.");
        return;
      }
      const isPro = await purchasePackage(pkg);
      if (isPro) {
        H.success();
        await refreshPremium();
        navigation.goBack();
      }
    } catch (e) {
      if (e.userCancelled) return;
      showAlert("Hata", "Satın alma işlemi başarısız oldu. Lütfen tekrar dene.");
    } finally {
      setPurchasing(false);
    }
  }, [getSelectedPackage, user?.id, refreshPremium, navigation, showAlert]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    try {
      const isPro = await restorePurchases();
      if (isPro) {
        H.success();
        await refreshPremium();
        showAlert("Başarılı", "Premium üyeliğin geri yüklendi!");
        navigation.goBack();
      } else {
        showAlert("Bulunamadı", "Aktif bir abonelik bulunamadı.");
      }
    } catch {
      showAlert("Hata", "Geri yükleme başarısız oldu.");
    } finally {
      setPurchasing(false);
    }
  }, [user?.id, refreshPremium, navigation, showAlert]);

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
          <Button
            onPress={handlePurchase}
            loading={purchasing}
            size="lg"
            fullWidth
            style={{ ...SHADOWS.fab }}
          >
            Hemen Başla
          </Button>
          <Text style={s.socialProof}>7 gün ücretsiz dene, beğenmezsen iptal et</Text>
          <Text style={s.cancelText}>İstediğin zaman iptal edebilirsin</Text>
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
    restoreBtn: { alignItems: "center", paddingVertical: SPACING.sm, marginTop: SPACING.xs },
    restoreText: { ...TYPOGRAPHY.captionMedium, textDecorationLine: "underline" },
    linkText: { ...TYPOGRAPHY.caption, color: C.sec, textDecorationLine: "underline" },
    linkDot: { ...TYPOGRAPHY.caption, color: C.muted },
  });
}
