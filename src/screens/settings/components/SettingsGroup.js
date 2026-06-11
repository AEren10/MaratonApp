import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function SettingsGroup({ title, children }) {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: C.muted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    paddingVertical: SPACING.xs,
  },
};
