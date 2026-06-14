import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { ProgressRing, AnimatedNumber, Icon } from "../../../components/design";
import { C, PASTEL, TYPOGRAPHY } from "../../../themes/tokens";

// Halo hero: büyük günlük hedef halkası + nabız atan alev rozeti + count-up.
export function GoalHalo({ solved = 0, goal = 100, streak = 0, onPress }) {
  const safeGoal = goal > 0 ? goal : 100;
  const pct = solved / safeGoal;
  const done = solved >= safeGoal;
  const remaining = Math.max(0, safeGoal - solved);
  const ring = done ? PASTEL.mint.solid : PASTEL.gold.solid;

  // Alev nabzı
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(
      withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, []);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.wrap, pressed && { opacity: 0.9 }]}>
      <View style={s.ringHolder}>
        <ProgressRing size={156} stroke={12} value={pct} color={ring} trackColor={ring + "22"}>
          {done ? (
            <View style={{ alignItems: "center" }}>
              <Icon name="checkCircle" size={30} color={PASTEL.mint.solid} sw={2.2} />
              <Text style={[s.sub, { color: PASTEL.mint.solid, marginTop: 4 }]}>tamamlandı!</Text>
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <AnimatedNumber value={remaining} style={s.bigNum} />
              <Text style={s.sub}>soru kaldı</Text>
            </View>
          )}
        </ProgressRing>

        <Animated.View style={[s.flameBadge, flameStyle]}>
          <Icon name="flame" size={16} color="#FFFFFF" sw={2.2} />
          {streak > 0 ? <Text style={s.flameText}>{streak}</Text> : null}
        </Animated.View>
      </View>

      <Text style={s.label}>BUGÜNKÜ HEDEF · {solved}/{safeGoal}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 6 },
  ringHolder: { width: 156, height: 156, alignItems: "center", justifyContent: "center" },
  bigNum: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, color: C.text, letterSpacing: -1, includeFontPadding: false },
  sub: { ...TYPOGRAPHY.caption, color: C.sec },
  flameBadge: {
    position: "absolute", top: 4, right: 18,
    minWidth: 38, height: 38, paddingHorizontal: 6, borderRadius: 19,
    backgroundColor: PASTEL.coral.solid,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3,
    borderWidth: 3, borderColor: C.bg,
  },
  flameText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFFFFF" },
  label: { ...TYPOGRAPHY.label, color: C.muted, marginTop: 14 },
});
