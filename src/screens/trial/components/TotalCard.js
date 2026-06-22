import { useMemo } from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const makeStyles = (C) => ({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.bodySemiBold,
    color: C.sec,
  },
  value: {
    ...TYPOGRAPHY.statSmall,
    color: C.accent,
  },
});

export function TotalCard({ totalNet }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Toplam Net</Text>
      <Text style={styles.value}>{totalNet}</Text>
    </View>
  );
}
