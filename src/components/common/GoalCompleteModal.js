import { memo, useEffect } from "react";
import { MomentBackdrop } from "../design/MomentBackdrop";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";

import { Icon, Button } from "../design";
import { CenterCard } from "../design/CenterCard";
import { useC } from "../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";
import { alpha } from "../../themes/colorMix";
import { dailyMinutesGoalOf, formatMinutes } from "../../domain/home/weeklyEffort";
import { selectWeeklyMinutesGoal } from "../../store/slices/goalsSlice";
import { selectStreak } from "../../store/slices/studyLogSlice";

const SETTLE = { duration: 520, dampingRatio: 0.55 };
const SWAY = { duration: 360, easing: Easing.inOut(Easing.sin) };

// HEDEF CIZGISI GECILDI. Bayrak yerine oturur ve dalgalanir; altinda
// bugun ne yapildigi (gercek sayilar). Konfeti/XP yok (kullanici, 3 Ekim).
export const GoalCompleteModal = memo(function GoalCompleteModal({ visible, solved = 0, minutes = 0, onDismiss, onShare }) {
  const C = useC();
  const reduced = useReducedMotion();
  const goalMinutes = dailyMinutesGoalOf(useSelector(selectWeeklyMinutesGoal));
  const streak = useSelector(selectStreak) || 0;
  const pop = useSharedValue(reduced ? 1 : 0.6);
  const sway = useSharedValue(0);

  useEffect(() => {
    if (!visible || reduced) return;
    pop.set(0.6);
    pop.set(withSpring(1, SETTLE));
    sway.set(withDelay(300, withSequence(withRepeat(withTiming(1, SWAY), 6, true), withTiming(0, SWAY))));
  }, [visible, reduced, pop, sway]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const flagStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${(sway.get() - 0.5) * 16}deg` }] }));

  const lines = [
    solved > 0 ? `${solved} soru çözdün.` : null,
    streak > 0 ? `${streak} günlük serin bugün de sürdü.` : null,
    "Bugünkü çalışman rotana işlendi.",
  ].filter(Boolean);

  return (
    <CenterCard visible={visible} onClose={onDismiss} style={s.card}>
      <MomentBackdrop height={260} flip fadeColor={C.surface} style={s.backdrop} />
      <Animated.View style={[s.badge, { backgroundColor: alpha(C.up, 16), borderColor: alpha(C.up, 35) }, badgeStyle]}>
        <Animated.View style={flagStyle}>
          <Icon name="flag" size={30} color={C.up} />
        </Animated.View>
      </Animated.View>
      <Text style={[TYPOGRAPHY.label, s.center, { color: C.up }]}>BUGÜN HEDEFE ULAŞTIN</Text>
      <Text style={[TYPOGRAPHY.statLarge, s.center, { color: C.text }]}>{formatMinutes(minutes)}</Text>
      {goalMinutes > 0 ? (
        <Text style={[TYPOGRAPHY.meta, s.center, { color: C.text3 }]}>{`günlük hedefin ${formatMinutes(goalMinutes)}`}</Text>
      ) : null}
      <View style={[s.lines, { borderTopColor: C.line }]}>
        {lines.map((line) => (
          <Text key={line} style={[TYPOGRAPHY.body, s.center, { color: C.text2 }]}>{line}</Text>
        ))}
      </View>
      <View style={s.buttons}>
        {onShare ? <Button onPress={onShare} variant="outline" icon="share" style={s.flex}>Paylaş</Button> : null}
        <Button onPress={onDismiss} variant="primary" style={s.flex}>Devam et</Button>
      </View>
    </CenterCard>
  );
});

const s = StyleSheet.create({
  card: { padding: STEP.s4, alignItems: "center", gap: STEP.s1, overflow: "hidden" },
  backdrop: { left: -40, right: undefined },
  badge: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: STEP.s1 },
  center: { textAlign: "center" },
  lines: { alignSelf: "stretch", borderTopWidth: 1, marginTop: STEP.s2, paddingTop: STEP.s2, gap: 4 },
  buttons: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3, alignSelf: "stretch" },
  flex: { flex: 1 },
});
