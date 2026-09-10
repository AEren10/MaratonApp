import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Icon } from "../../../components/design";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

function RouteNextActionPanel({ action, C, disabled, onStart }) {
  if (!action) return null;
  return (
    <View style={[styles.card, { backgroundColor: C.accent + "12", borderColor: C.accent + "35" }]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: C.accent + "18" }]}>
          <Icon name="play" size={16} color={C.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: C.accent }]}>SIRADAKİ ROTA HAMLESİ</Text>
          <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
            {action.title}
          </Text>
          <Text style={[styles.body, { color: C.sec }]}>{action.message}</Text>
        </View>
      </View>
      <Button
        fullWidth
        icon="play"
        disabled={disabled}
        onPress={onStart}
        accessibilityLabel={`Sıradaki rota durağını başlat: ${action.title}`}
        accessibilityHint={action.message}
      >
        {disabled ? "Rota donduruldu" : action.actionLabel}
      </Button>
    </View>
  );
}

export default memo(RouteNextActionPanel);

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
  },
  icon: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro },
  title: { ...TYPOGRAPHY.bodySemiBold, marginTop: 2 },
  body: { ...TYPOGRAPHY.caption, marginTop: 2 },
});
