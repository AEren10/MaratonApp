import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

export function EmptyState({ icon = "bookOpen", title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={36} color={C.muted} />
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.caption,
    color: C.muted,
    marginTop: SPACING.sm,
    textAlign: "center",
    maxWidth: 260,
  },
  actionBtn: {
    marginTop: SPACING.xxl,
    backgroundColor: C.amber,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  actionText: {
    ...TYPOGRAPHY.button,
    color: C.bg,
  },
});
