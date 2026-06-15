import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing,
} from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Pist hero: günün ilerlemesi = pist üzerinde koşan nokta (başlangıç → 🏁).
// CANLI versiyon — GlassCard sönüklüğü yerine düz amber gradient + dekoratif kabarcıklar.
export function GoalTrack({ solved = 0, goal = 100, hoursLeft, onPress }) {
  const C = useC();
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
  const heroColor = done ? C.green : C.amber;
  const accentColor = done ? "#5BD89F" : C.coral;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.94 }}>
      <LinearGradient
        colors={done
          ? ["#FFFBED", "#FFF4D9", "#FFE7B0"]
          : ["#FFF4DC", "#FFE3B0", "#FFD27A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, {
          borderColor: heroColor + "55",
          shadowColor: heroColor,
        }]}
      >
        {/* Dekoratif kabarcıklar */}
        <View style={[s.bubbleA, { backgroundColor: accentColor + "26" }]} />
        <View style={[s.bubbleB, { backgroundColor: heroColor + "22" }]} />

        <View style={s.head}>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: "#3A2A05" }]}>Bugünkü pistin</Text>
            <Text style={[s.subtitle, { color: "#7A5F1F" }]}>
              {done ? "bitiş çizgisindesin 🎉" : `${remaining} soru kaldı${hoursLeft ? ` · ~${hoursLeft} saat` : ""}`}
            </Text>
          </View>
          <View style={[s.badge, { backgroundColor: heroColor }]}>
            <Icon name="zap" size={22} color="#FFFFFF" sw={2.6} />
          </View>
        </View>

        <View style={s.lane}>
          <View style={[s.laneBg, { backgroundColor: "rgba(58,42,5,0.14)" }]} />
          <Animated.View style={[s.laneFillWrap, fillStyle]}>
            <LinearGradient colors={[heroColor, accentColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.laneFill} />
          </Animated.View>
          <Animated.View style={[s.runner, { backgroundColor: accentColor }, runnerStyle]}>
            <Icon name="zap" size={15} color="#FFFFFF" sw={2.6} />
          </Animated.View>
          <View style={s.flag}><Icon name="flag" size={20} color={heroColor} sw={2.4} /></View>
        </View>

        <Text style={[s.big, { color: "#2A1F05" }]}>
          {solved}<Text style={[s.small, { color: "#7A5F1F" }]}> / {safeGoal} soru</Text>
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
  },
  bubbleA: {
    position: "absolute", top: -36, right: -28, width: 130, height: 130, borderRadius: 65,
  },
  bubbleB: {
    position: "absolute", bottom: -40, left: -30, width: 100, height: 100, borderRadius: 50,
  },
  head: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { ...TYPOGRAPHY.caption, marginTop: 3, fontFamily: "Inter_500Medium" },
  badge: {
    width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 8, elevation: 4,
  },
  lane: { height: 40, marginBottom: 12, justifyContent: "center" },
  laneBg: { position: "absolute", left: 0, right: 26, height: 6, borderRadius: 3 },
  laneFillWrap: { position: "absolute", left: 0, height: 6, borderRadius: 3, overflow: "hidden", maxWidth: "100%" },
  laneFill: { flex: 1, height: 6 },
  runner: {
    position: "absolute", top: 5, width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.20, shadowRadius: 5, elevation: 3,
  },
  flag: { position: "absolute", right: 0, top: 11 },
  big: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 34, letterSpacing: -1 },
  small: { ...TYPOGRAPHY.bodyMedium, fontSize: 15 },
});
