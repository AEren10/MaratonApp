import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Tasarimin secim cipi: h38 r6. Secili: marka tonu zemin + accent kenar.
// dot: ders rengi karesi (yalniz ders cipinde). badge: "TAHMİN" gibi ek.
// dashed: "Konu ara" gibi eylem cipi.
export const ChoiceChip = memo(function ChoiceChip({
  label, active, onPress, dot, badge, dashed, icon, a11yLabel,
}) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={a11yLabel || label}
      hitSlop={{ top: 3, bottom: 3 }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? C.brandTint : "transparent",
          borderColor: active ? C.accent : C.border,
          borderStyle: dashed ? "dashed" : "solid",
        },
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      {active && !dot ? <Icon name="check" size={11} color={C.accent} sw={2.4} /> : null}
      {icon ? <Icon name={icon} size={12} color={C.text3} /> : null}
      <Text
        style={[
          active ? TYPOGRAPHY.bodySemiBold : TYPOGRAPHY.captionMedium,
          styles.text,
          { color: active ? C.text : dashed ? C.text3 : C.text2 },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge ? (
        <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>{badge}</Text>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    height: CONTROL.chip,
    paddingHorizontal: STEP.s2 + 3,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    maxWidth: "100%",
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
  text: { fontSize: TYPOGRAPHY.caption.fontSize, lineHeight: TYPOGRAPHY.caption.lineHeight, flexShrink: 1 },
});
