import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

// Illustrated empty state — gradient circle + icon, soft shadow, friendly tone.
export function EmptyState({
  icon = "bookOpen",
  title = "Henüz bir şey yok",
  message,
  actionLabel,
  onAction,
  color = "purple",
}) {
  const C = useC();
  const accent = C[color] || C.purple;
  const accent2 = accent + "60";

  return (
    <View style={styles.container}>
      {/* Concentric illustrated circles */}
      <View style={styles.illustration}>
        <View style={[styles.outerRing, { backgroundColor: accent + "0A" }]} />
        <View style={[styles.midRing, { backgroundColor: accent + "18" }]} />
        <LinearGradient
          colors={[accent, accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerCircle}
        >
          <Icon name={icon} size={36} color="#FFFFFF" sw={2.2} />
        </LinearGradient>
      </View>

      {title ? (
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
      ) : null}
      {message ? (
        <Text style={[styles.message, { color: C.muted }]}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: accent, shadowColor: accent },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: SPACING.xxxl,
  },
  illustration: {
    width: 140, height: 140,
    alignItems: "center", justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: 140, height: 140, borderRadius: 70,
  },
  midRing: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
  },
  innerCircle: {
    width: 68, height: 68, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.subheading,
    marginTop: SPACING.xl,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.sm,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: SPACING.xxl,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 5,
  },
  actionText: {
    ...TYPOGRAPHY.button,
    color: "#FFFFFF",
  },
});
