import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { PAYWALL_FOOTNOTE } from "../../../constants/paywallContexts";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";
import { PaywallContextBlock } from "./PaywallContextBlock";
import { PaywallPlanPicker } from "./PaywallPlanPicker";
import { PaywallLegalRow } from "./PaywallLegalRow";

// Tasarim: baglam paywall'i isin USTUNDE alt sayfa olarak cikar; arkadaki
// ekran karartilmis halde gorunur kalir (secim, liste korunur).
export function PaywallSheet({ context, purchase, onDismiss }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(520)} style={StyleSheet.absoluteFill}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={context.secondary}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(620)}
        style={[styles.sheet, { backgroundColor: C.bg, borderTopColor: C.elev, maxHeight: height * 0.94 }]}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + STEP.s3 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.grabber, { backgroundColor: C.elev }]} />
          <PaywallContextBlock C={C} context={context} />

          <PaywallPlanPicker
            plans={purchase.displayPlans}
            selected={purchase.selectedPlan}
            onSelect={purchase.setSelectedPlan}
            style={styles.plans}
          />

          <Button
            onPress={purchase.handlePurchase}
            loading={purchase.purchasing}
            size="lg"
            fullWidth
            style={styles.cta}
          >
            {context.primary}
          </Button>
          <Pressable onPress={onDismiss} style={styles.secondary} accessibilityRole="button">
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>{context.secondary}</Text>
          </Pressable>
          <Text style={[TYPOGRAPHY.micro, styles.center, { color: C.text3 }]}>{PAYWALL_FOOTNOTE}</Text>
          <PaywallLegalRow onRestore={purchase.handleRestore} disabled={purchase.purchasing} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: SHAPE.sheet,
    borderTopRightRadius: SHAPE.sheet,
    overflow: "hidden",
  },
  content: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: STEP.s3 },
  plans: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s3 },
  secondary: { height: CONTROL.tapMin, alignItems: "center", justifyContent: "center", marginTop: 4 },
  center: { textAlign: "center" },
});
