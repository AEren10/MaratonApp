import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

export function StudyTimerHeader({ C, eyebrow, eyebrowColor, onBack, onHistory }) {
  return (
    <View style={s.container}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityLabel="Geri"
        accessibilityRole="button"
        style={({ pressed }) => [
          s.iconBtn,
          {
            backgroundColor: C.surface,
            borderColor: C.line,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Icon name="x" size={18} color={C.text2} sw={2} />
      </Pressable>

      <View style={[s.badge, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={[s.badgeDot, { backgroundColor: eyebrowColor || C.accent }]} />
        <Text
          style={[
            TYPOGRAPHY.label,
            { color: eyebrowColor || C.text2, fontSize: 11, letterSpacing: 1.3 },
          ]}
          accessibilityRole="text"
          numberOfLines={1}
        >
          {eyebrow}
        </Text>
      </View>

      <Pressable
        onPress={onHistory}
        hitSlop={8}
        accessibilityLabel="Geçmiş"
        accessibilityRole="button"
        style={({ pressed }) => [
          s.iconBtn,
          {
            backgroundColor: C.surface,
            borderColor: C.line,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Icon name="clock" size={20} color={C.text2} sw={2} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    minHeight: CONTROL.tapMin,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: "60%",
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    flexShrink: 0,
  },
});


