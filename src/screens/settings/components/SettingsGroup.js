import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { GlassCard } from "../../../components/design";

export function SettingsGroup({ title, children }) {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <GlassCard radius={RADIUS.xxl} style={styles.card}>{children}</GlassCard>
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
    paddingVertical: SPACING.xs,
  },
};
