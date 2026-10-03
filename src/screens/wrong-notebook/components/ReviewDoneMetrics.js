import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Yalniz oturumun gercek sayilari. Eskiden sabit dort renkli cubuk ve
// "Bu konu 9 gun sonra tekrar onerilecek" yaziyordu.
export function ReviewDoneMetrics({ C, rememberedCount, forgotCount, pendingBefore, pendingAfter, resolvedShare = 0 }) {
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
        <View style={[styles.track, { backgroundColor: C.track }]}>
          <View style={[styles.bar, { width: `${Math.round(resolvedShare * 100)}%`, backgroundColor: C.up }]} />
        </View>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s2 }]}>
          Tekrar kayda geçti. Sıradaki tekrar günü her soru için ayrı hesaplandı.
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
  track: { height: 6, borderRadius: 3, marginTop: STEP.s2, overflow: "hidden" },
  bar: { height: 6, borderRadius: 3 },
});
