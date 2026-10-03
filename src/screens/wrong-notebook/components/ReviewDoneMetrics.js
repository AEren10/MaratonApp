import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function ReviewDoneMetrics({ C, rememberedCount, forgotCount, pendingBefore, pendingAfter }) {
  return (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.metrics}>
      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={[TYPOGRAPHY.label, { color: C.text }]}>BİLDİM</Text>
          <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 32, marginTop: STEP.s1 }]}>{rememberedCount}</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>aralık uzadı</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİLEMEDİM</Text>
          <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 32, marginTop: STEP.s1 }]}>{forgotCount}</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>yarın tekrar</Text>
        </Card>
      </View>

      <Card style={styles.fullCard}>
        <View style={styles.cardHeader}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>DEFTER DURUMU</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
            {`${pendingBefore} → `}<Text style={{ color: C.text }}>{pendingAfter}</Text> bekliyor
          </Text>
        </View>
        <View style={styles.progressRow}>
          <View style={[styles.bar, { flex: 3, backgroundColor: C.warn }]} />
          <View style={[styles.bar, { flex: 2, backgroundColor: C.text2 }]} />
          <View style={[styles.bar, { flex: 2, backgroundColor: C.text3 }]} />
          <View style={[styles.bar, { flex: 1, backgroundColor: C.line }]} />
        </View>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s2 }]}>
          Tekrar kayda geçti. Bu konu 9 gün sonra tekrar önerilecek.
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  metrics: { marginTop: STEP.s4, gap: STEP.s2 },
  row: { flexDirection: "row", gap: STEP.s2 },
  halfCard: { flex: 1 },
  fullCard: { marginTop: STEP.s2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressRow: { flexDirection: "row", gap: 4, marginTop: STEP.s2 },
  bar: { height: 6, borderRadius: 3 },
});
