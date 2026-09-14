import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import * as H from "../../../../lib/haptics";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

// Gunun Ozeti · "Hemen paylaş": kartin kucuk onizlemesi + paylasim kartina gecis.
export function SummaryShareRow({ value, onPress }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => { H.tap(); onPress?.(); }}
        style={({ pressed }) => [styles.row, { backgroundColor: C.elev, borderColor: C.border, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
      >
        <View style={[styles.thumb, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>{value}</Text>
          <View style={[styles.mark, { backgroundColor: C.accent }]} />
        </View>
        <View style={styles.flex}>
          <Text style={[TYPOGRAPHY.button, { color: C.text }]}>Hemen paylaş</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 / 2 }]}>Kart olarak ya da fotoğrafının üstüne</Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s3, paddingHorizontal: GUTTER },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, padding: STEP.s2, borderRadius: SHAPE.sheet, borderWidth: 1 },
  thumb: { width: 40, height: 70, borderRadius: SHAPE.iconBox, borderWidth: 1, justifyContent: "space-between", padding: STEP.s1 / 2 },
  mark: { width: 8, height: 8, borderRadius: STEP.s1 / 4 },
  flex: { flex: 1 },
});
