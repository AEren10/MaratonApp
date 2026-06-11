import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function TotalCard({ totalNet }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Toplam Net</Text>
      <Text style={styles.value}>{totalNet}</Text>
    </View>
  );
}

const styles = {
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
    color: C.amber,
  },
};
