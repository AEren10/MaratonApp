import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { ProgressRing, AnimatedNumber, Icon, SparkBurst } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as haptic from "../../../lib/haptics";

// Whoop iskeleti: dev animasyonlu ring + nabız atan streak ateşi + ince ayraçlı stat rayı.
// Kart yığını YOK — tek nefes, hareket dolu hero.
function StatCell({ label, value, decimals, color, valueColor, icon, trend, trendColor, delay = 0, onPress, dormantHint }) {
  const isDormant = dormantHint && value === 0;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(440).springify().damping(16)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={s.cell}>
        <View style={[s.cellChip, { backgroundColor: color + (isDormant ? "12" : "1F") }]}>
          <Icon name={icon} size={13} color={color} sw={2.6} style={isDormant ? { opacity: 0.5 } : undefined} />
        </View>
        {isDormant ? (
          <Text style={[s.cellDormant, { color: valueColor }]} numberOfLines={1}>{dormantHint}</Text>
        ) : (
          <View style={s.cellValRow}>
            <AnimatedNumber
              value={value}
              format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
              style={[s.cellValue, { color: valueColor }]}
            />
            {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={13} color={trendColor} sw={2.6} /> : null}
          </View>
        )}
        <Text style={[s.cellLabel, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function HomeHero({ solved = 0, goal = 100, minutes = 0, streak = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onRingPress, onStreak, onNet, onLeague }) {
  const C = useC();
  const safeGoal = goal > 0 ? goal : 100;
  const timeOnly = solved === 0 && minutes > 0;
  const pct = timeOnly ? Math.min(1, minutes / 60) : Math.min(1, solved / safeGoal);
  const done = timeOnly ? minutes >= 60 : solved >= safeGoal;
  const ringColor = done ? C.green : C.accent;
  const isNewUser = solved === 0 && minutes === 0 && streak === 0 && net === 0 && xp === 0;

  const [sparkVisible, setSparkVisible] = useState(false);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current) setSparkVisible(true);
    prevDone.current = done;
  }, [done]);

  // Yeni kullanıcı play icon pulse
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isNewUser) {
      pulse.value = withRepeat(withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ), -1, false);
    } else { pulse.value = 1; }
  }, [isNewUser]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

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
      <Pressable onPress={() => { haptic.tap(); onRingPress?.(); }} style={s.ringWrap}>
        {done ? (
          <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignSelf: "center", borderRadius: 110, backgroundColor: ringColor }, glowStyle]} />
        ) : null}
        <ProgressRing size={172} stroke={14} value={pct} color={ringColor} trackColor={ringColor + "18"}>
          {isNewUser ? (
            <>
              <Text style={[s.ringTop, { color: C.muted }]}>BAŞLANGIÇ NOKTASIN</Text>
              <Animated.View style={pulseStyle}>
                <Icon name="play" size={40} color={C.accent} sw={2} />
              </Animated.View>
              <Text style={[s.ringSub, { color: C.sec, marginTop: 6 }]}>İlk çalışmanı kaydet</Text>
            </>
          ) : timeOnly ? (
            <>
              <Text style={[s.ringTop, { color: C.accent }]}>BUGÜN ÇALIŞILAN</Text>
              <View style={s.ringValRow}>
                <AnimatedNumber value={minutes} style={[s.ringVal, { color: C.text }]} />
                <Text style={[s.ringUnit, { color: C.sec }]}>dk</Text>
              </View>
              <Text style={[s.ringSub, { color: C.sec }]}>{done ? "Harika tempo! 🏁" : "Devam et!"}</Text>
              <Text style={[s.ringHint, { color: C.muted }]}>dokunarak kaydet</Text>
            </>
          ) : (
            <>
              <Text style={[s.ringTop, { color: C.accent }]}>BUGÜN</Text>
              <View style={s.ringValRow}>
                <AnimatedNumber value={solved} style={[s.ringVal, { color: C.text }]} />
                {pct > 0.05 && <Icon name="flame" size={14 + Math.round(Math.min(1, pct) * 12)} color={C.orange} sw={2} style={{ marginLeft: -4, marginTop: 6 }} />}
              </View>
              <Text style={[s.ringSub, { color: C.sec }]}>/ {safeGoal} soru {done ? "🏁" : ""}</Text>
              <Text style={[s.ringHint, { color: C.muted }]}>dokunarak kaydet</Text>
            </>
          )}
        </ProgressRing>
        <SparkBurst trigger={sparkVisible} onDone={() => setSparkVisible(false)} />
      </Pressable>

      <View style={s.rail}>
        <StatCell label="gün seri" value={streak} color={C.orange} valueColor={C.text} icon="activity" delay={120} onPress={onStreak} dormantHint={isNewUser ? "Başlat" : null} />
        <View style={[s.div, { backgroundColor: C.border }]} />
        <StatCell label="son net" value={net} decimals color={C.blue} valueColor={C.text} icon="chart" trend={trend} trendColor={trend > 0 ? C.green : C.red} delay={200} onPress={onNet} dormantHint={isNewUser ? "İlk deneme" : null} />
        <View style={[s.div, { backgroundColor: C.border }]} />
        <StatCell label={`${tier} · XP`} value={xp} color={C.amber} valueColor={C.text} icon="trophy" delay={280} onPress={onLeague} dormantHint={isNewUser ? "XP kazan" : null} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: SPACING.xs },
  ringWrap: { marginTop: SPACING.sm, marginBottom: SPACING.md },
  ringTop: { ...TYPOGRAPHY.label, letterSpacing: 1, marginBottom: 2 },
  ringValRow: { flexDirection: "row", alignItems: "flex-start" },
  ringVal: { ...TYPOGRAPHY.statLarge, fontSize: 56, lineHeight: 60 },
  ringUnit: { ...TYPOGRAPHY.bodySemiBold, fontSize: 18, marginLeft: 2, marginTop: SPACING.lg },
  ringSub: { ...TYPOGRAPHY.bodyMedium, marginTop: 2 },
  ringHint: { ...TYPOGRAPHY.micro, marginTop: SPACING.sm, letterSpacing: 0.5 },
  rail: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", paddingVertical: SPACING.md },
  cell: { flex: 1, alignItems: "center", gap: SPACING.xs },
  cellChip: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cellValRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  cellLabel: { ...TYPOGRAPHY.label, letterSpacing: 0.4 },
  cellValue: { ...TYPOGRAPHY.statMedium, fontSize: 21 },
  cellDormant: { ...TYPOGRAPHY.bodyMedium, letterSpacing: -0.1 },
  div: { width: 1, height: 34 },
});
