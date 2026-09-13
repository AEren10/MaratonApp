import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";

// Canta satiri: kare isaret kutusu + kalem + (zorunluysa) "zorunlu".
// Sinav Gunu Plani ve Ana Sayfa "Sınav Günü" modu ayni satiri kullanir.
export const ExamCheckRow = memo(function ExamCheckRow({ item, onToggle, last = false }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => onToggle?.(item.key)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.done }}
      accessibilityLabel={item.label}
      style={[s.row, { borderTopColor: C.line }, last && { borderBottomWidth: 1, borderBottomColor: C.line }]}
    >
      <View
        style={[
          s.box,
          item.done ? { backgroundColor: C.brandFill } : { borderWidth: 1.8, borderColor: C.border },
        ]}
      >
        {item.done ? <Icon name="check" size={12} color={C.accentInk} sw={2.1} /> : null}
      </View>
      <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: item.done ? C.text : C.text2 }]}>
        {item.label}
      </Text>
      {item.required ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>zorunlu</Text> : null}
    </Pressable>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 3,
    minHeight: CONTROL.tapMin + STEP.s2, borderTopWidth: 1,
  },
  box: { width: 24, height: 24, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
});
