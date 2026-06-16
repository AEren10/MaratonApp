import { Text, Pressable, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedNumber, Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";

// 3 solid sıcak baloncuk — dolu renk + beyaz içerik. Canlı, kart kart bağımsız.
function Bubble({ delay, color, value, label, decimals, trend, icon, onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(15)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }}>
        <View style={[s.bubble, { backgroundColor: color, shadowColor: color }]}>
          <View style={s.iconBox}>
            <Icon name={icon} size={14} color="#FFFFFF" sw={2.4} />
          </View>
          <View style={s.valueRow}>
            <AnimatedNumber
              value={value}
              format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
              style={s.value}
            />
            {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={12} color="#FFFFFF" /> : null}
          </View>
          <Text style={s.label} numberOfLines={1}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function StatBubbles({ streak = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onStreak, onNet, onLeague }) {
  return (
    <View style={s.row}>
      <Bubble delay={60}  color="#FF5A3C" value={streak} label="gün seri"     icon="flame"  onPress={onStreak} />
      <Bubble delay={140} color="#2E8BFF" value={net} decimals trend={trend} label="son net" icon="chart" onPress={onNet} />
      <Bubble delay={220} color="#8B5CF6" value={xp} label={`${tier} · XP`}   icon="trophy" onPress={onLeague} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  bubble: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    gap: 6,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center", justifyContent: "center",
  },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  value: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, letterSpacing: -0.6, color: "#FFFFFF" },
  label: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
});
