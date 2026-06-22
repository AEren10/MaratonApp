import { memo, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { TYT_DERSLER } from "../../../data/curriculum";

const SubjectPill = memo(function SubjectPill({ subject, active, onPress }) {
  const C = useC();
  const handlePress = useCallback(() => onPress(subject.key), [onPress, subject.key]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        height: 36,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        backgroundColor: active ? subject.color + "18" : C.surface,
        borderColor: active ? subject.color : C.border,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: subject.color,
        }}
      />
      <Text
        style={{
          ...TYPOGRAPHY.captionMedium,
          color: active ? subject.color : C.sec,
        }}
      >
        {subject.label}
      </Text>
    </Pressable>
  );
});

export const SubjectPicker = memo(function SubjectPicker({ selected, onSelect }) {
  const C = useC();

  return (
    <View style={{ marginTop: SPACING.sm }}>
      <Text
        style={{
          ...TYPOGRAPHY.label,
          color: C.muted,
          marginBottom: SPACING.xs,
          marginLeft: SPACING.lg,
        }}
      >
        DERS SEÇ
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          gap: SPACING.sm,
        }}
      >
        {TYT_DERSLER.map((subject) => (
          <SubjectPill
            key={subject.key}
            subject={subject}
            active={selected === subject.key}
            onPress={onSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
});
