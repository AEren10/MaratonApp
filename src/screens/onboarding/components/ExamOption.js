import { Pressable, View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// Hedef Seç ekranındaki sınav/alan seçim kartı — 20px köşe, kare radio.
export function ExamOption({ item, selected, onPress, C }) {
  const active = selected === item.id;
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      style={{
        flexDirection: "row", alignItems: "center", gap: STEP.s2 + STEP.s1 / 2,
        borderRadius: SHAPE.card, paddingVertical: STEP.s2 + 2, paddingHorizontal: STEP.s3 - 2,
        backgroundColor: active ? C.brandTint : C.surface,
        borderWidth: 1, borderColor: active ? C.accent : C.elev,
        minHeight: CONTROL.tapMin,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{item.label}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>{item.desc}</Text>
      </View>
      <View
        style={{
          width: 22, height: 22, borderRadius: 4, flexShrink: 0,
          borderWidth: 1.8, borderColor: active ? C.accent : C.text4,
          alignItems: "center", justifyContent: "center",
          backgroundColor: active ? C.accent : "transparent",
        }}
      >
        {active && <Icon name="check" size={12} color={C.accentInk} sw={2.6} />}
      </View>
    </Pressable>
  );
}
