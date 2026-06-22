import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing,
} from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SHADOWS } from "../../../themes/tokens";

// Pist hero: günün ilerlemesi = pist üzerinde koşan nokta (başlangıç → 🏁).
// "Sunset" — sıcak mercan-turuncu-pembe gradyan kart, üstünde beyaz pist.
// Tek başına canlı imza; light/dark fark etmeksizin aynı (hero marka rengini taşır).
const INK = "#FFFFFF";
const INK_SUB = "rgba(255,255,255,0.82)";

export function GoalTrack({ solved = 0, goal = 100, hoursLeft, onPress }) {
  const safeGoal = goal > 0 ? goal : 100;
  const pct = Math.min(1, solved / safeGoal);
  const done = solved >= safeGoal;

  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    progress.value = withTiming(pct, { duration: 1100, easing: Easing.out(Easing.cubic) });
    pulse.value = withRepeat(withSequence(
      withTiming(1.18, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const runnerStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
    transform: [{ translateX: -15 }, { scale: pulse.value }],
  }));

  const remaining = Math.max(0, safeGoal - solved);
  // in-progress = sunset coral, done = sıcak gold→coral kutlama
  const grad = done ? ["#ff6b35", "#ff8a3c", "#fbbf24"] : ["#8b5cf6", "#a78bfa", "#c084fc"];
  const shadow = done ? "#ff6b35" : "#8b5cf6";
  const badgeIcon = done ? "#ff6b35" : "#8b5cf6";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.94 }}>
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, { shadowColor: shadow }]}
      >
        {/* Dekoratif mürekkep kabarcıkları */}
        <View style={[s.bubbleA, { backgroundColor: "rgba(21,22,26,0.08)" }]} />
        <View style={[s.bubbleB, { backgroundColor: "rgba(21,22,26,0.06)" }]} />

        <View style={s.head}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Bugünkü pistin</Text>
            <Text style={s.subtitle}>
              {done ? "bitiş çizgisindesin 🎉" : `${remaining} soru kaldı${hoursLeft ? ` · ~${hoursLeft} saat` : ""}`}
            </Text>
          </View>
          <View style={s.badge}>
            <Icon name="zap" size={22} color={badgeIcon} sw={2.6} />
          </View>
        </View>

        <View style={s.lane}>
          <View style={s.laneBg} />
          <Animated.View style={[s.laneFillWrap, fillStyle]}>
            <View style={s.laneFill} />
          </Animated.View>
          <Animated.View style={[s.runner, runnerStyle]}>
            <Icon name="zap" size={15} color={badgeIcon} sw={2.6} />
          </Animated.View>
          <View style={s.flag}><Icon name="flag" size={20} color={INK} sw={2.4} /></View>
        </View>

        <Text style={s.big}>
          {solved}<Text style={s.small}> / {safeGoal} soru</Text>
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 22,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 6,
  },
  bubbleA: { position: "absolute", top: -36, right: -28, width: 130, height: 130, borderRadius: 65 },
  bubbleB: { position: "absolute", bottom: -40, left: -30, width: 100, height: 100, borderRadius: 50 },
  head: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, letterSpacing: -0.5, color: INK },
  subtitle: { ...TYPOGRAPHY.caption, marginTop: 3, fontFamily: "Inter_600SemiBold", color: INK_SUB },
  badge: {
    width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center",
    backgroundColor: INK,
    ...SHADOWS.card,
  },
  lane: { height: 40, marginBottom: 12, justifyContent: "center" },
  laneBg: { position: "absolute", left: 0, right: 26, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.32)" },
  laneFillWrap: { position: "absolute", left: 0, height: 6, borderRadius: 3, overflow: "hidden", maxWidth: "100%" },
  laneFill: { flex: 1, height: 6, backgroundColor: INK },
  runner: {
    position: "absolute", top: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: INK,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.85)",
    ...SHADOWS.sm,
  },
  flag: { position: "absolute", right: 0, top: 11 },
  big: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 34, letterSpacing: -1, color: INK },
  small: { ...TYPOGRAPHY.bodyMedium, fontSize: 15, color: INK_SUB },
});
