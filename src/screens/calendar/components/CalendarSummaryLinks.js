import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Takvim -> ozetler. Tasarim capraz baglari: "Takvim ve Seri · güne dokun ->
// Günün Özeti", "Program'ın ay sekmesi · Ayın Özeti de buraya".
export function CalendarSummaryLinks({ showDay, onDay, onMonth }) {
  const C = useC();
  const rows = [
    showDay ? { key: "day", label: "Günün özetine bak", onPress: onDay } : null,
    { key: "month", label: "Ayın Özeti", onPress: onMonth },
  ].filter(Boolean);

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      {rows.map((row, i) => (
        <Press haptic="none"
          key={row.key}
          accessibilityRole="button"
          onPress={() => { H.tap(); row.onPress?.(); }}
          style={[styles.row, i > 0 && { borderTopWidth: 1, borderColor: C.line }]}
        >
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{row.label}</Text>
          <Icon name="chevR" size={14} color={C.text3} />
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: SHAPE.panel, borderWidth: 1, paddingHorizontal: STEP.s3, marginTop: STEP.s3 },
  row: { flexDirection: "row", alignItems: "center", minHeight: CONTROL.tapMin + STEP.s1, gap: STEP.s1 },
});
