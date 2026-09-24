import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { Card, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { usePaywallMomentData } from "../../../hooks/usePaywallMomentData";
import { PAYWALL_MOMENT as M } from "../../../constants/paywallMoment";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";
import { PaywallMomentHero } from "./PaywallMomentHero";
import { PaywallBullet } from "./PaywallBullet";
import { PaywallProCard } from "./PaywallProCard";
import { PaywallLegalRow } from "./PaywallLegalRow";

// Tasarim: "Paywall Anı". Baglami olmayan kaynaklarda (kilitli rota
// ekrani) tam ekran. Once ucretsizde acik kalanlar, sonra Pro teklifi.
export function PaywallMoment({ purchase, onDismiss }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const data = usePaywallMomentData();

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onDismiss} style={styles.close} accessibilityRole="button" accessibilityLabel={M.secondary}>
          <Icon name="x" size={14} color={C.text2} sw={1.7} />
        </Pressable>
        {data.dayNumber ? (
          <Text style={[TYPOGRAPHY.label, styles.eyebrow, { color: C.text3 }]}>{M.dayEyebrow(data.dayNumber)}</Text>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s4 }}>
        <Animated.View>
          <PaywallMomentHero hero={data.hero} />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(520).delay(160)} style={styles.body}>
          {data.pastFirstWeek ? (
            <Card tone="surface" radius="panel" style={styles.quote}>
              <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{M.quote}</Text>
            </Card>
          ) : null}

          <View style={styles.labelRow}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{M.freeLabel}</Text>
            <View style={[styles.hairline, { backgroundColor: C.line }]} />
          </View>
          <View style={styles.freeList}>
            {M.free.map((line) => <PaywallBullet key={line} text={line} tone="free" />)}
          </View>

          <View style={styles.block}>
            <PaywallProCard purchase={purchase} />
          </View>

          <Pressable
            onPress={onDismiss}
            style={[styles.secondary, { borderColor: C.border }]}
            accessibilityRole="button"
          >
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>{M.secondary}</Text>
          </Pressable>
          <PaywallLegalRow onRestore={purchase.handleRestore} disabled={purchase.purchasing} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  eyebrow: { flex: 1 },
  body: { paddingHorizontal: GUTTER },
  quote: { marginTop: STEP.s2 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s3 },
  hairline: { flex: 1, height: 1 },
  freeList: { marginTop: STEP.s2, gap: STEP.s2 },
  block: { marginTop: STEP.s3 },
  secondary: {
    height: CONTROL.buttonTertiary,
    marginTop: STEP.s3,
    borderWidth: 1,
    borderRadius: SHAPE.button,
    alignItems: "center",
    justifyContent: "center",
  },
});
