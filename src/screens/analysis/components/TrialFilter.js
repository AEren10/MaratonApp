import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";

function getFilters(examType) {
  if (examType === "lgs") {
    return [
      { key: "ALL", label: "Tümü" },
      { key: "LGS", label: "LGS" },
      { key: "BRANCH", label: "Branş" },
    ];
  }
  return [
    { key: "ALL", label: "Tümü" },
    { key: "TYT", label: "TYT" },
    { key: "AYT", label: "AYT" },
    { key: "BRANCH", label: "Branş" },
  ];
}

const makeStyles = (C) => ({
  row: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    alignItems: "center",
  },
  label: {
    ...TYPOGRAPHY.bodySemiBold,
  },
});

export function TrialFilter({ value, onChange }) {
  const C = useC();
  const { examType } = useExam();
  const styles = useMemo(() => makeStyles(C), [C]);
  const FILTERS = useMemo(() => getFilters(examType), [examType]);
  return (
    <View style={styles.row}>
      {FILTERS.map((f) => {
        const active = value === f.key;
        return (
          <Pressable
            key={f.key}
            accessibilityRole="tab"
            accessibilityLabel={f.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(f.key)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? C.accent + "20" : "transparent",
                borderColor: active ? C.accent : C.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? C.accent : C.sec },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

