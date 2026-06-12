import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon, IconBox } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { ALL_SUBJECTS } from "../trialTypes";

export function BranchSubjectPicker({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Hangi Ders?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {ALL_SUBJECTS.map((s) => {
          const active = value === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => onChange(s.key)}
              style={[
                styles.chip,
                {
                  borderColor: active ? s.color : C.border,
                  backgroundColor: active ? s.color + "20" : C.surface,
                },
              ]}
            >
              <IconBox icon={s.icon} color={s.color} size={26} rounded={8} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.parent, { color: s.color }]}>{s.parent}</Text>
                <Text style={[styles.name, { color: active ? s.color : C.text }]}>
                  {s.name}
                </Text>
              </View>
              <Text style={styles.max}>{s.max}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = {
  wrap: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: C.muted,
    marginBottom: SPACING.sm,
  },
  scroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  chip: {
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  parent: {
    ...TYPOGRAPHY.micro,
    letterSpacing: 0.5,
  },
  name: {
    ...TYPOGRAPHY.bodySemiBold,
  },
  max: {
    ...TYPOGRAPHY.captionMedium,
    color: C.muted,
  },
};
