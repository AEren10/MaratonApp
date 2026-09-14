import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Uc yoldan biri: kare secim kutusu, baslik, aciklama. Secili kizil tint.
function GapOptionRow({ option, selected, onSelect }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => { if (!option.disabled) { H.select(); onSelect(option.key); } }}
      disabled={option.disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: Boolean(option.disabled) }}
      style={[
        s.row,
        selected
          ? { backgroundColor: C.brandTint, borderColor: C.accent }
          : { backgroundColor: C.surface, borderColor: C.elev },
        option.disabled && { opacity: 0.5 },
      ]}
    >
      <View style={[s.box, selected ? { backgroundColor: C.accent, borderColor: C.accent } : { borderColor: C.border }]}>
        {selected ? <Icon name="check" size={12} color={C.accentInk} sw={2.5} /> : null}
      </View>
      <View style={s.copy}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{option.title}</Text>
        {option.body ? (
          <Text style={[TYPOGRAPHY.meta, s.body, { color: C.text3 }]}>{option.body}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(GapOptionRow);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s2 + 1,
    paddingVertical: STEP.s3 - 4,
    paddingHorizontal: STEP.s3 - 2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  box: { width: 20, height: 20, marginTop: STEP.s1 / 8, borderRadius: SHAPE.chip - 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0 },
  body: { marginTop: STEP.s1 / 2 + 1, lineHeight: 19 },
});
