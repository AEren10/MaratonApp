import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { ProgressRing, AnimatedNumber, Icon, SparkBurst } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import * as haptic from "../../../lib/haptics";

// Whoop iskeleti: dev animasyonlu ring + nabız atan streak ateşi + ince ayraçlı stat rayı.
// Kart yığını YOK — tek nefes, hareket dolu hero.
function StatCell({ label, value, decimals, color, valueColor, icon, trend, trendColor, delay = 0, onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(440).springify().damping(16)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={s.cell}>
        <View style={[s.cellChip, { backgroundColor: color + "1F" }]}>
          <Icon name={icon} size={13} color={color} sw={2.6} />
        </View>
        <View style={s.cellValRow}>
          <AnimatedNumber
            value={value}
            format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
            style={[s.cellValue, { color: valueColor }]}
          />
          {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={13} color={trendColor} sw={2.6} /> : null}
        </View>
        <Text style={[s.cellLabel, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function HomeHero({ solved = 0, goal = 100, streak = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onRingPress, onStreak, onNet, onLeague }) {
  const C = useC();
  const safeGoal = goal > 0 ? goal : 100;
  const pct = Math.min(1, solved / safeGoal);
  const done = solved >= safeGoal;
  const ringColor = done ? C.green : C.accent;

  const [sparkVisible, setSparkVisible] = useState(false);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current) setSparkVisible(true);
    prevDone.current = done;
  }, [done]);

  const flame = useSharedValue(1);
  useEffect(() => {
    flame.value = withRepeat(withSequence(
      withTiming(1.16, { duration: 620, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, []);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flame.value }] }));

  // Hedef bitince: nabız atan glow halesi (konfeti değil — sakin parıltı)
  const glow = useSharedValue(0);
  useEffect(() => {
    if (done) {
      glow.value = withRepeat(withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ), -1, false);
    } else { glow.value = 0; }
  }, [done]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.12 + glow.value * 0.33, transform: [{ scale: 1 + glow.value * 0.14 }] }));

  return (
    <Animated.View entering={FadeInDown.duration(480).springify().damping(18)} style={s.wrap}>
      {/* Streak ateşi — nabız atan */}
      <Pressable onPress={() => { haptic.tap(); onStreak?.(); }} style={[s.streak, { backgroundColor: C.coral + "1A", borderColor: C.coral + "30" }]}>
        <Animated.View style={flameStyle}><Icon name="flame" size={18} color={C.coral} sw={2.4} /></Animated.View>
        <Text style={[s.streakNum, { color: C.coral }]}>{streak}</Text>
        <Text style={[s.streakLbl, { color: C.coral }]}>gün</Text>
      </Pressable>

      <Pressable onPress={() => { haptic.tap(); onRingPress?.(); }} style={s.ringWrap}>
        {done ? (
          <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignSelf: "center", borderRadius: 110, backgroundColor: ringColor }, glowStyle]} />
        ) : null}
        <ProgressRing size={196} stroke={15} value={pct} color={ringColor} trackColor={C.surface2 || C.border}>
          <Text style={[s.ringTop, { color: C.muted }]}>BUGÜN ÇÖZÜLEN</Text>
          <View style={s.ringValRow}>
            <AnimatedNumber value={solved} style={[s.ringVal, { color: C.text }]} />
          </View>
          <Text style={[s.ringSub, { color: C.sec }]}>/ {safeGoal} soru {done ? "🏁" : ""}</Text>
        </ProgressRing>
        <SparkBurst trigger={sparkVisible} onDone={() => setSparkVisible(false)} />
      </Pressable>

      <View style={[s.rail, { borderColor: C.border }]}>
        <StatCell label="SERİ" value={streak} color={C.coral} valueColor={C.text} icon="flame" delay={120} onPress={onStreak} />
        <View style={[s.div, { backgroundColor: C.border }]} />
        <StatCell label="SON NET" value={net} decimals color={C.blue} valueColor={C.text} icon="chart" trend={trend} trendColor={trend > 0 ? C.green : C.red} delay={200} onPress={onNet} />
        <View style={[s.div, { backgroundColor: C.border }]} />
        <StatCell label={tier.toUpperCase()} value={xp} color={C.purple} valueColor={C.text} icon="trophy" delay={280} onPress={onLeague} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 8 },
  streak: { position: "absolute", top: 6, right: 0, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  streakNum: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, letterSpacing: -0.3 },
  streakLbl: { fontFamily: "Inter_600SemiBold", fontSize: 11, opacity: 0.8 },
  ringWrap: { marginTop: 18, marginBottom: 22 },
  ringTop: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  ringValRow: { flexDirection: "row", alignItems: "flex-start" },
  ringVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 62, lineHeight: 64, letterSpacing: -2 },
  ringSub: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 2 },
  rail: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", borderWidth: 1, borderRadius: 20, paddingVertical: 14 },
  cell: { flex: 1, alignItems: "center", gap: 5 },
  cellChip: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cellValRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  cellLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.4 },
  cellValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, letterSpacing: -0.6 },
  div: { width: 1, height: 34 },
});
