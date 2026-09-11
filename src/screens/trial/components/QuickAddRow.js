import { Pressable, Text, View, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Hızlı Ekle listesindeki tekil satır. Nokta rengi kararlı/nötr —
// ders bağlamı olmadığı için ders rengi kullanılmıyor.
export function QuickAddRow({ C, title, subtitle, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={() => { H.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}
    >
      <View style={[styles.dot, { backgroundColor: C.text3 }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{title}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{subtitle}</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    minHeight: CONTROL.tapMin, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.card, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
});
