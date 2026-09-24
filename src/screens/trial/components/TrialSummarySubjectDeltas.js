import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDelta, formatNet } from "../../../lib/format";

function Row({ bar, C }) {
  const tone = bar.delta > 0 ? C.up : bar.delta < 0 ? C.down : C.text3;
  const fill = bar.max > 0 ? Math.max(0, Math.min(1, bar.net / bar.max)) : 0;
  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: bar.color }]} />
        <Text style={[TYPOGRAPHY.tableName, styles.name, { color: C.text }]} numberOfLines={1}>{bar.name}</Text>
        <Text style={[TYPOGRAPHY.topicName, styles.value, { color: C.text }]}>{formatNet(bar.net)}</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, styles.delta, { color: tone }]}>
          {bar.delta != null ? formatDelta(bar.delta, 2) : ""}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: C.track }]}>
        <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: bar.color }]} />
      </View>
    </View>
  );
}

// DERS DERS DEGISIM: net, onceki denemeye gore fark ve soru sayisina oranla cubuk.
export function TrialSummarySubjectDeltas({ bars }) {
  const C = useC();
  if (!bars.length) return null;
  return (
    <Animated.View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DERS DERS DEĞİŞİM</Text>
      <View style={{ marginTop: 6 }}>
        {bars.map((bar) => <Row key={bar.key} bar={bar} C={C} />)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginTop: STEP.s3 + 6 },
  row: { paddingVertical: STEP.s2 + 2, borderTopWidth: 1 },
  head: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2 - 1 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  name: { flex: 1 },
  value: { width: 64, textAlign: "center", fontVariant: ["tabular-nums"] },
  delta: { width: 46, textAlign: "right", fontVariant: ["tabular-nums"] },
  track: { height: 5, borderRadius: 2, marginTop: STEP.s1 + 2, marginLeft: 19, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});

