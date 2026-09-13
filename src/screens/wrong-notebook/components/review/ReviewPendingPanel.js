import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "DEFTERDE BEKLEYEN" | "BU SORU" girinti paneli. Bildim sonrasi eski sayi
// soluk kalir, ok ile yeni sayiya gecer (hat eski halden yeni hale).
export function ReviewPendingPanel({ before, now, status }) {
  const C = useC();
  const changed = now !== before;
  return (
    <View style={[styles.panel, { backgroundColor: C.void, borderColor: C.line }]}>
      <View style={styles.col}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>DEFTERDE BEKLEYEN</Text>
        <View style={styles.numRow}>
          {changed ? (
            <>
              <Text style={[TYPOGRAPHY.statMedium, { color: C.text3 }]}>{before}</Text>
              <Icon name="arrowR" size={13} color={C.text4} />
            </>
          ) : null}
          <Animated.Text key={now} entering={FadeIn.duration(500)} style={[TYPOGRAPHY.statMedium, { color: C.text }]}>
            {now}
          </Animated.Text>
          {!changed ? (
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>soru bekliyor</Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: C.line }]} />
      <View style={[styles.col, styles.right]}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>BU SORU</Text>
        <Animated.Text
          key={status.next}
          entering={FadeIn.duration(500)}
          style={[TYPOGRAPHY.bodyMedium, styles.next, { color: status.color }]}
        >
          {status.next}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 3,
    paddingHorizontal: STEP.s2 + 4,
    borderRadius: SHAPE.cardTight + 2,
    borderWidth: 1,
  },
  col: { flex: 1, minWidth: 0 },
  right: { alignItems: "flex-end" },
  numRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: 6 },
  divider: { width: 1, alignSelf: "stretch" },
  next: { marginTop: 7, textAlign: "right" },
});
