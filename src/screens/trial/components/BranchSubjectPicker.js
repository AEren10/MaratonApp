import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Icon, IconBox } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getAllSubjects } from "../trialTypes";

const makeStyles = (C) => ({
  wrap: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: C.muted,
    marginBottom: SPACING.sm,
    letterSpacing: 0.7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  parent: {
    ...TYPOGRAPHY.micro,
    letterSpacing: 0.6,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    ...TYPOGRAPHY.bodySemiBold,
    marginTop: 2,
  },
  maxBox: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 48,
  },
  maxText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 16,
    letterSpacing: -0.4,
  },
  maxSub: {
    ...TYPOGRAPHY.micro,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
});

// Alt alta dizilmiş ders kartları — TYT/AYT chip etiketli, kompakt.
export function BranchSubjectPicker({ value, onChange }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const ALL_SUBJECTS = useMemo(() => getAllSubjects(C), [C]);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>HANGİ DERS?</Text>
      <View style={{ gap: 8 }}>
        {ALL_SUBJECTS.map((s) => {
          const active = value === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => onChange(s.key)}
              style={[
                styles.row,
                {
                  borderColor: active ? s.color : C.border,
                  backgroundColor: active ? s.color + "16" : C.surface,
                },
              ]}
            >
              <IconBox icon={s.icon} color={s.color} size={36} rounded={11} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.parent, { color: s.color }]}>{s.parent}</Text>
                <Text style={[styles.name, { color: C.text }]}>
                  {s.name}
                </Text>
              </View>
              <View style={[styles.maxBox, { backgroundColor: s.color + "1A" }]}>
                <Text style={[styles.maxText, { color: s.color }]}>{s.max}</Text>
                <Text style={[styles.maxSub, { color: s.color + "B3" }]}>soru</Text>
              </View>
              {active && (
                <View style={{
                  position: "absolute", top: 8, right: 8,
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: s.color,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="check" size={11} color="#FFFFFF" sw={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

