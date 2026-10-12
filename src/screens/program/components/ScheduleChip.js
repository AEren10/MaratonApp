import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Ders programi cipi. tone: "subject" (ders renginde tint zemin ve kenarlik),
// "dashed" (Deneme günü / Boş gün), "plain" (secilmemis secenek: ders rengi
// verilmisse silik ders tonunda -- duz gri secenekler cok soluktu, 12 Ekim).
function ScheduleChip({ label, color, tone = "subject", onPress, selected }) {
  const C = useC();
  const chipColor = color || C.accent;

  const look = tone === "dashed"
    ? {
        borderColor: selected ? chipColor : C.border,
        backgroundColor: selected ? chipColor + "18" : "transparent",
        borderStyle: selected ? "solid" : "dashed",
        color: selected ? C.text : C.text3,
      }
    : tone === "plain"
      ? {
          borderColor: color ? color + "40" : C.line,
          backgroundColor: color ? color + "0F" : C.surface,
          borderStyle: "solid",
          color: color ? color + "CC" : C.text3,
        }
      : {
          borderColor: chipColor + "A6",
          backgroundColor: chipColor + "33",
          borderStyle: "solid",
          color: chipColor,
        };

  const content = (
    <Text numberOfLines={1} style={[s.text, { color: look.color }]}>{label}</Text>
  );
  const box = [
    s.chip,
    {
      borderColor: look.borderColor,
      backgroundColor: look.backgroundColor,
      borderStyle: look.borderStyle,
    },
  ];

  if (!onPress) return <View style={box}>{content}</View>;
  return (
    <Press
      haptic="none"
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      style={[box]}
    >
      {content}
    </Press>
  );
}

export default memo(ScheduleChip);

const s = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  text: {
    fontFamily: TYPOGRAPHY.captionMedium.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
});
