import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { usePaywallPurchase } from "../../hooks/usePaywallPurchase";
import { usePremiumPlanRows } from "../../hooks/usePremiumPlanRows";
import { PRO_FEATURES, PRO_PITCH } from "../../constants/proPitch";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { ProFeatureItem } from "./components/ProFeatureItem";
import { ProPlanRow } from "./components/ProPlanRow";

// Tasarim: "Premium". Baglamsiz, tam sunum. Baglama ozel paywall ayri
// ekran (PaywallScreen). Satin alma mantigi usePaywallPurchase'te.
export default function PremiumScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(C), [C]);

  const { selectedPlan, setSelectedPlan, purchasing, displayPlans, handlePurchase, handleRestore } =
    usePaywallPurchase();
  const planRows = usePremiumPlanRows(displayPlans);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable
          onPress={() => { H.tap(); navigation.goBack(); }}
          style={s.close}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
        >
          <Icon name="x" size={14} color={C.text2} sw={1.7} />
        </Pressable>
        <View style={s.spacer} />
        <Pressable
          onPress={handleRestore}
          disabled={purchasing}
          style={s.restore}
          accessibilityRole="button"
        >
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{PRO_PITCH.restore}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520)}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{PRO_PITCH.eyebrow}</Text>
          <Text style={[TYPOGRAPHY.display, s.title, { color: C.text }]}>{PRO_PITCH.title}</Text>
          <Text style={[TYPOGRAPHY.body, s.lead, { color: C.text3 }]}>{PRO_PITCH.lead}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(520).delay(120)} style={s.features}>
          {PRO_FEATURES.map((f) => (
            <ProFeatureItem key={f.name} name={f.name} desc={f.desc} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(520).delay(200)} style={s.plans}>
          {planRows.map((plan) => (
            <ProPlanRow
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={setSelectedPlan}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(520).delay(280)} style={s.cta}>
          <Button onPress={handlePurchase} loading={purchasing} size="lg" fullWidth>
            {PRO_PITCH.cta}
          </Button>
          <Text style={[TYPOGRAPHY.micro, s.note, { color: C.text3 }]}>{PRO_PITCH.ctaNote}</Text>
        </Animated.View>

        <View style={{ height: insets.bottom + STEP.s4 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: GUTTER - 10,
      paddingTop: 4,
    },
    close: {
      width: CONTROL.tapMin,
      height: CONTROL.tapMin,
      alignItems: "center",
      justifyContent: "center",
    },
    spacer: { flex: 1 },
    restore: {
      height: CONTROL.tapMin,
      paddingHorizontal: STEP.s1,
      justifyContent: "center",
    },
    scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
    title: { marginTop: STEP.s1 * 2, maxWidth: 300 },
    lead: { marginTop: STEP.s1 * 2, maxWidth: 296 },
    features: { marginTop: STEP.s4 },
    plans: { marginTop: STEP.s4, gap: STEP.s1 },
    cta: { marginTop: STEP.s4 },
    note: { marginTop: STEP.s2, textAlign: "center" },
  });
}
