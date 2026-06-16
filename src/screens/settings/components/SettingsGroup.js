import { useMemo } from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GlassCard } from "../../../components/design";

export function SettingsGroup({ title, children }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <GlassCard radius={RADIUS.xxl} style={styles.card}>{children}</GlassCard>
    </View>
  );
}

const makeStyles = (C) => ({
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
});
