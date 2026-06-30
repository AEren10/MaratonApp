import { memo, useMemo } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn, BounceIn } from "react-native-reanimated";
import { Icon, SparkBurst, AnimatedPressable, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const CONFETTI_ICONS = [
  { name: "trophy", color: "#fbbf24" },
  { name: "star", color: "#fbbf24" },
  { name: "flame", color: "#f97316" },
  { name: "zap", color: "#a78bfa" },
  { name: "award", color: "#34d399" },
  { name: "target", color: "#60a5fa" },
];

export const GoalCompleteModal = memo(function GoalCompleteModal({ visible, solved, goal, xpEarned = 0, onDismiss, onShare }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.burstWrap} pointerEvents="none">
          <SparkBurst trigger={visible} />
        </View>

        <Animated.View entering={ZoomIn.springify().damping(14)} style={s.card}>
          <View style={s.confettiRow}>
            {CONFETTI_ICONS.map((c, i) => (
              <Animated.View key={i} entering={BounceIn.delay(200 + i * 80)}>
                <Icon name={c.name} size={24} color={c.color} />
              </Animated.View>
            ))}
          </View>

          <Animated.Text entering={FadeInDown.delay(300)} style={s.title}>
            Günlük Hedef Tamam!
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(400)} style={s.statsRow}>
            <View style={[s.statBox, { backgroundColor: C.green + "14" }]}>
              <Text style={[s.statNum, { color: C.green }]}>{solved}</Text>
              <Text style={[s.statLabel, { color: C.green }]}>soru</Text>
            </View>
            {xpEarned > 0 && (
              <View style={[s.statBox, { backgroundColor: C.accent + "14" }]}>
                <Text style={[s.statNum, { color: C.accent }]}>+{xpEarned}</Text>
                <Text style={[s.statLabel, { color: C.accent }]}>XP</Text>
              </View>
            )}
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(500)} style={s.sub}>
            Harika gidiyorsun! Bugünkü hedefini tamamladın.
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(600)} style={s.btnRow}>
            {onShare && (
              <Button onPress={onShare} variant="outline" icon="share" style={{ flex: 1 }}>Paylaş</Button>
            )}
            <Button onPress={onDismiss} variant="success" style={{ flex: 1 }}>Devam Et</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
});

function makeStyles(C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)", alignItems: "center", justifyContent: "center", padding: SPACING.xxxl },
    burstWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: "100%", borderRadius: RADIUS.xxl, padding: SPACING.xxxl,
      alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    confettiRow: { flexDirection: "row", gap: SPACING.xs, marginBottom: SPACING.md },
    confettiIcon: { marginHorizontal: SPACING.xs },
    title: { ...TYPOGRAPHY.heading, color: C.text, textAlign: "center" },
    sub: { ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center", marginTop: SPACING.md, lineHeight: 22 },
    statsRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl },
    statBox: { alignItems: "center", paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl },
    statNum: { ...TYPOGRAPHY.statSmall, fontSize: 28 },
    statLabel: { ...TYPOGRAPHY.micro, marginTop: SPACING.xs },
    btnRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xxl, width: "100%" },
  });
}
