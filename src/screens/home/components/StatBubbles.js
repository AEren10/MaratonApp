import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedNumber, Icon } from "../../../components/design";
import { C, PASTEL, TYPOGRAPHY } from "../../../themes/tokens";

// Halo altı: 3 renkli baloncuk stat, sırayla zıplayarak girer + count-up.
function Bubble({ delay, color, icon, value, label, decimals, trend, onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(14)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={({ pressed }) => [s.bubble, { backgroundColor: color.tint }, pressed && { opacity: 0.8 }]}>
        <View style={[s.iconChip, { backgroundColor: color.tint }]}>
          <Icon name={icon} size={16} color={color.solid} />
        </View>
        <View style={s.valueRow}>
          <AnimatedNumber
            value={value}
            format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
            style={[s.value, { color: color.solid }]}
          />
          {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={12} color={trend > 0 ? PASTEL.mint.solid : PASTEL.rose.solid} /> : null}
        </View>
        <Text style={s.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function StatBubbles({ streak = 0, best = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onStreak, onNet, onLeague }) {
  return (
    <View style={s.row}>
      <Bubble delay={60} color={PASTEL.coral} icon="flame" value={streak} label="gün seri" onPress={onStreak} />
      <Bubble delay={140} color={PASTEL.blue} icon="chart" value={net} decimals trend={trend} label="son net" onPress={onNet} />
      <Bubble delay={220} color={PASTEL.violet} icon="trophy" value={xp} label={`${tier} · XP`} onPress={onLeague} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  bubble: { borderRadius: 22, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center", gap: 6 },
  iconChip: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  value: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, letterSpacing: -0.5 },
  label: { ...TYPOGRAPHY.micro, color: C.sec },
});
