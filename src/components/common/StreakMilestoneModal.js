import { useMemo } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { Icon, SparkBurst, AnimatedPressable, Button } from "../design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

export default function StreakMilestoneModal({ visible, milestone, onDismiss }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  if (!milestone) return null;
  const color = milestone.color || C.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={s.backdrop}>
        {milestone.day >= 30 && (
          <View style={s.burstWrap} pointerEvents="none">
            <SparkBurst trigger={visible} />
          </View>
        )}
        <Animated.View entering={ZoomIn.springify().damping(milestone.day >= 60 ? 10 : 14)} style={s.card}>
          {/* Icon */}
          <Animated.View entering={ZoomIn.delay(100).springify().damping(11)} style={s.iconWrap}>
            <View style={[s.iconGlow, { backgroundColor: color }]} />
            <View style={[s.iconCircle, { backgroundColor: color + "22" }]}>
              <Icon name={milestone.icon || "flame"} size={44} color={color} sw={2.2} />
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.Text entering={FadeInDown.delay(160)} style={s.title}>
            {milestone.title}
          </Animated.Text>

          {/* Day count */}
          <Animated.Text entering={FadeInDown.delay(220)} style={[s.days, { color }]}>
            {milestone.day} Gün Serisi!
          </Animated.Text>

          {/* XP reward */}
          <Animated.View entering={FadeInDown.delay(300)} style={[s.xpBadge, { backgroundColor: color + "18" }]}>
            <Text style={[s.xpText, { color }]}>+{milestone.xp} XP</Text>
          </Animated.View>

          {/* Premium gift */}
          {milestone.premiumDays > 0 && (
            <Animated.Text entering={FadeIn.delay(380)} style={s.premium}>
              {"🎁"} {milestone.premiumDays} gün Premium hediye!
            </Animated.Text>
          )}

          {/* Dismiss */}
          <Animated.View entering={FadeIn.delay(440)} style={{ width: "100%", alignItems: "center", marginTop: SPACING.md }}>
            <Button onPress={onDismiss} fullWidth>Harika!</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    backdrop: {
      flex: 1, backgroundColor: "rgba(0,0,0,0.70)",
      alignItems: "center", justifyContent: "center",
    },
    burstWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center", justifyContent: "center",
    },
    card: {
      backgroundColor: C.surface, borderRadius: RADIUS.xxl,
      borderWidth: 1, borderColor: C.border,
      padding: SPACING.xxxl, alignItems: "center",
      marginHorizontal: SPACING.xxxl, width: "85%", maxWidth: 340,
    },
    iconWrap: {
      width: 96, height: 96, alignItems: "center",
      justifyContent: "center", marginBottom: SPACING.xl,
    },
    iconGlow: {
      position: "absolute", width: 96, height: 96,
      borderRadius: 48, opacity: 0.15,
    },
    iconCircle: {
      width: 80, height: 80, borderRadius: 40,
      alignItems: "center", justifyContent: "center",
    },
    title: {
      ...TYPOGRAPHY.heading, color: C.text,
      textAlign: "center", marginBottom: SPACING.sm,
    },
    days: {
      ...TYPOGRAPHY.subheading, textAlign: "center",
      marginBottom: SPACING.lg,
    },
    xpBadge: {
      borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm, marginBottom: SPACING.lg,
    },
    xpText: { ...TYPOGRAPHY.heading, fontSize: 22 },
    premium: {
      ...TYPOGRAPHY.bodyMedium, color: C.sec,
      textAlign: "center", marginBottom: SPACING.sm,
    },
  });
}
