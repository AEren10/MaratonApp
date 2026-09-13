import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Tasarimin gezinme satiri: surface zemin + elev kenar, baslik, alt satir,
// sagda istege bagli deger (ya da borc cipi) ve sonuk ok.
function RouteLinkRow({ title, subtitle, value, chip, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, value || chip].filter(Boolean).join(", ")}
      style={({ pressed }) => [
        s.row,
        { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.elev },
      ]}
    >
      <View style={s.copy}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[TYPOGRAPHY.micro, s.sub, { color: C.text3 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {value ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{value}</Text> : null}
      {chip ? (
        <View style={[s.chip, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}>
          <Text style={[TYPOGRAPHY.tableHead, s.chipText, { color: C.accentBright }]}>{chip}</Text>
        </View>
      ) : null}
      <Icon name="chevR" size={13} color={C.text5} />
    </Pressable>
  );
}

export default memo(RouteLinkRow);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  sub: { marginTop: STEP.s1 / 2 },
  chip: {
    minHeight: 26,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    justifyContent: "center",
  },
  chipText: { letterSpacing: 0 },
});
