import { memo, useMemo } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

export const GoalCompleteModal = memo(function GoalCompleteModal({ visible, solved, goal, xpEarned = 0, onDismiss, onShare }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <Animated.View entering={FadeIn.duration(320)} style={s.card}>
          <View style={[s.badge, { backgroundColor: C.up + "18", borderColor: C.up + "33" }]}>
            <Icon name="checkCircle" size={32} color={C.up} />
          </View>

          <Animated.Text entering={FadeIn.delay(100).duration(280)} style={s.title}>
            Günlük Hedef Tamam!
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(180).duration(280)} style={s.statsRow}>
            <View style={[s.statBox, { backgroundColor: C.up + "14" }]}>
              <Text style={[s.statNum, { color: C.up }]}>{solved}</Text>
              <Text style={[s.statLabel, { color: C.up }]}>soru</Text>
            </View>
            {xpEarned > 0 && (
              <View style={[s.statBox, { backgroundColor: C.accent + "14" }]}>
                <Text style={[s.statNum, { color: C.accent }]}>+{xpEarned}</Text>
                <Text style={[s.statLabel, { color: C.accent }]}>XP</Text>
              </View>
            )}
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(240).duration(280)} style={s.sub}>
            Harika gidiyorsun! Bugünkü hedefini tamamladın.
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(300).duration(250)} style={s.btnRow}>
            {onShare && (
              <Button onPress={onShare} variant="outline" icon="share" style={{ flex: 1 }}>Paylaş</Button>
            )}
            <Button onPress={onDismiss} variant="primary" style={{ flex: 1 }}>Devam Et</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
});

function makeStyles(C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)", alignItems: "center", justifyContent: "center", padding: SPACING.xxxl },
    card: {
      width: "100%", borderRadius: RADIUS.xxl, padding: SPACING.xxxl,
      alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    badge: {
      width: 56, height: 56, borderRadius: 28, borderWidth: 1,
      alignItems: "center", justifyContent: "center", marginBottom: SPACING.md,
    },
    title: { ...TYPOGRAPHY.heading, color: C.text, textAlign: "center" },
    sub: { ...TYPOGRAPHY.bodyMedium, color: C.text2, textAlign: "center", marginTop: SPACING.md, lineHeight: 22 },
    statsRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl },
    statBox: { alignItems: "center", paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl },
    statNum: { ...TYPOGRAPHY.statSmall, fontSize: 28 },
    statLabel: { ...TYPOGRAPHY.micro, marginTop: SPACING.xs },
    btnRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xxl, width: "100%" },
  });
}
