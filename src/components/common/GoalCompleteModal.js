import { memo, useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn, BounceIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const CONFETTI = ["🎉", "⭐", "🔥", "💪", "✨", "🏆"];

export const GoalCompleteModal = memo(function GoalCompleteModal({ visible, solved, goal, onDismiss, onShare }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  if (!visible) return null;

  const handleShare = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onShare?.();
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={s.overlay}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={s.card}>
          <View style={s.confettiRow}>
            {CONFETTI.map((e, i) => (
              <Animated.Text key={i} entering={BounceIn.delay(200 + i * 80)} style={s.confetti}>
                {e}
              </Animated.Text>
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
            <View style={[s.statBox, { backgroundColor: C.accent + "14" }]}>
              <Text style={[s.statNum, { color: C.accent }]}>+40</Text>
              <Text style={[s.statLabel, { color: C.accent }]}>XP</Text>
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(500)} style={s.sub}>
            Harika gidiyorsun! Bugünkü hedefini tamamladın.
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(600)} style={s.btnRow}>
            {onShare && (
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [s.shareBtn, { borderColor: C.accent }, pressed && { opacity: 0.85 }]}
              >
                <Icon name="share" size={16} color={C.accent} />
                <Text style={[s.shareBtnText, { color: C.accent }]}>Paylaş</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [s.mainBtn, { backgroundColor: C.green, ...SHADOWS.green }, pressed && { opacity: 0.9 }]}
            >
              <Text style={s.mainBtnText}>Devam Et</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
});

function makeStyles(C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 28 },
    card: {
      width: "100%", borderRadius: 28, padding: 28,
      alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    confettiRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
    confetti: { fontSize: 28 },
    title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, color: C.text, textAlign: "center" },
    sub: { ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center", marginTop: 12, lineHeight: 22 },
    statsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
    statBox: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.xl },
    statNum: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 28 },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
    btnRow: { flexDirection: "row", gap: 12, marginTop: 24, width: "100%" },
    shareBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 6, borderRadius: RADIUS.xl, paddingVertical: 14, borderWidth: 1.5,
    },
    shareBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
    mainBtn: {
      flex: 1, alignItems: "center", justifyContent: "center",
      borderRadius: RADIUS.xl, paddingVertical: 14,
    },
    mainBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
  });
}
