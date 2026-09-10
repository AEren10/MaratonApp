import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";

// Rota Hazır'daki durak satırı: sıra no + renk noktası + konu + zaman.
function RouteReadyStopRow({ stop }) {
  const C = useC();
  const identity = useSubjectIdentity(stop.subject);
  return (
    <View style={[styles.row, { borderTopColor: C.line }]} accessible accessibilityLabel={`${stop.position}. durak, ${stop.name}`}>
      <Text style={[TYPOGRAPHY.topicName, styles.n, { color: C.text3 }]}>{stop.position}</Text>
      <View style={[styles.dot, { backgroundColor: identity?.solid || C.accent }]} />
      <Text style={[TYPOGRAPHY.bodyMedium, styles.name, { color: C.text }]} numberOfLines={1}>
        {stop.name}
      </Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{stop.when}</Text>
    </View>
  );
}

export default memo(RouteReadyStopRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    paddingVertical: STEP.s2, borderTopWidth: 1,
  },
  n: { width: 26 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  name: { flex: 1 },
});
