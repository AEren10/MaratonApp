import { View, Text, Pressable } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const FILTERS = [
  { key: "ALL", label: "Tümü", color: C.text },
  { key: "TYT", label: "TYT", color: C.blue },
  { key: "AYT", label: "AYT", color: C.amber },
  { key: "BRANCH", label: "Branş", color: C.teal },
];

export function TrialFilter({ value, onChange }) {
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

const styles = {
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
};
