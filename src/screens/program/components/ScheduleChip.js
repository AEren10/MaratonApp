import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ders programi cipi. tone: "subject" (kizil tint zemin, ders renginde yazi),
// "dashed" (Deneme günü / Boş gün), "plain" (secilmemis secenek).
// Gorsel yukseklik 30; dokunulabilir olanlarda hitSlop ile 44'e tamamlanir.
function ScheduleChip({ label, color, tone = "subject", onPress, selected }) {
  const C = useC();
  const look = tone === "dashed"
    ? { borderColor: selected ? C.accent : C.border, borderStyle: "dashed", color: selected ? C.text : C.text3 }
    : tone === "plain"
      ? { borderColor: C.elev, backgroundColor: C.void, color: C.text3 }
      : { borderColor: C.bandEdge, backgroundColor: C.brandTint, color: color || C.text };

  const content = (
    <Text style={[TYPOGRAPHY.micro, s.text, { color: look.color }]}>{label}</Text>
  );
  const box = [s.chip, { borderColor: look.borderColor, backgroundColor: look.backgroundColor, borderStyle: look.borderStyle }];

  if (!onPress) return <View style={box}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: STEP.s1 - 1, bottom: STEP.s1 - 1 }}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      style={({ pressed }) => [box, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

export default memo(ScheduleChip);

const s = StyleSheet.create({
  chip: {
    height: 30,
    paddingHorizontal: STEP.s2 - 1,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    justifyContent: "center",
  },
  text: { fontFamily: TYPOGRAPHY.metaSemiBold.fontFamily },
});
