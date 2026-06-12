import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon, IconBox } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { TRIAL_TYPE_LIST } from "../trialTypes";

export function TrialTypeSelector({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Deneme Tipi</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {TRIAL_TYPE_LIST.map((t) => {
          const active = value === t.code;
          return (
            <Pressable
              key={t.code}
              onPress={() => onChange(t.code)}
              style={[
                styles.card,
                {
                  borderColor: active ? t.color : C.border,
                  backgroundColor: active ? t.color + "15" : C.surface,
                },
              ]}
            >
              <IconBox icon={t.icon} color={t.color} size={32} rounded={10} />
              <Text style={[styles.title, { color: active ? t.color : C.text }]}>
                {t.label}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {t.description}
              </Text>
              {active && (
                <View style={[styles.dot, { backgroundColor: t.color }]}>
                  <Icon name="check" size={12} color={C.bg} sw={3} />
                </View>
              )}
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
  card: {
    width: 160,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    position: "relative",
    gap: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.bodySemiBold,
    marginTop: SPACING.xs,
  },
  desc: {
    ...TYPOGRAPHY.caption,
    color: C.muted,
  },
  dot: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
};
