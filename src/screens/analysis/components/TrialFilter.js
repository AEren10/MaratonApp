import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const getFilters = (C) => [
  { key: "ALL", label: "Tümü", color: C.text },
  { key: "TYT", label: "TYT", color: C.blue },
  { key: "AYT", label: "AYT", color: C.amber },
  { key: "BRANCH", label: "Branş", color: C.teal },
];

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
  const styles = useMemo(() => makeStyles(C), [C]);
  const FILTERS = useMemo(() => getFilters(C), [C]);
  return (
    <View style={styles.row}>
      {FILTERS.map((f) => {
        const active = value === f.key;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? f.color + "20" : "transparent",
                borderColor: active ? f.color : C.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? f.color : C.sec },
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

