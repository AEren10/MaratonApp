import { Text, Pressable, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassCard, AnimatedNumber, Icon } from "../../../components/design";
import { C, PASTEL, TYPOGRAPHY } from "../../../themes/tokens";

// Halo altı: 3 cam stat baloncuğu, sırayla belirir + count-up.
function Bubble({ delay, color, value, label, decimals, trend, onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(15)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        <GlassCard radius={18} intensity={30} color={color.solid} style={s.bubble}>
          <View style={s.valueRow}>
            <AnimatedNumber
              value={value}
              format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
              style={[s.value, { color: color.solid }]}
            />
            {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={12} color={trend > 0 ? PASTEL.mint.solid : PASTEL.rose.solid} /> : null}
          </View>
          <Text style={s.label}>{label}</Text>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

export function StatBubbles({ streak = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onStreak, onNet, onLeague }) {
  return (
    <View style={s.row}>
      <Bubble delay={60} color={PASTEL.coral} value={streak} label="gün seri" onPress={onStreak} />
      <Bubble delay={140} color={PASTEL.gold} value={net} decimals trend={trend} label="son net" onPress={onNet} />
      <Bubble delay={220} color={PASTEL.rose} value={xp} label={`${tier} · XP`} onPress={onLeague} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  bubble: { paddingVertical: 14, paddingHorizontal: 12, alignItems: "center", gap: 4 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  value: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 23, letterSpacing: -0.5 },
  label: { ...TYPOGRAPHY.micro, color: C.sec },
});
