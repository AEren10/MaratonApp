import { Text, Pressable, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedNumber, Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// 3 kimlik renkli baloncuk — sade, canlı, kart kart bağımsız.
function Bubble({ delay, color, tint, value, label, decimals, trend, icon, onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(15)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }}>
        <View style={[s.bubble, { backgroundColor: tint, borderColor: color + "30" }]}>
          <View style={[s.iconBox, { backgroundColor: color + "26" }]}>
            <Icon name={icon} size={14} color={color} sw={2.4} />
          </View>
          <View style={s.valueRow}>
            <AnimatedNumber
              value={value}
              format={(v) => (decimals ? v.toFixed(1) : Math.round(v))}
              style={[s.value, { color }]}
            />
            {trend ? <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={12} color={trend > 0 ? "#22B47A" : "#E84855"} /> : null}
          </View>
          <Text style={[s.label, { color: color + "B3" }]} numberOfLines={1}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function StatBubbles({ streak = 0, net = 0, trend = 0, xp = 0, tier = "Bronz", onStreak, onNet, onLeague }) {
  const C = useC();
  return (
    <View style={s.row}>
      <Bubble
        delay={60}
        color={C.coral}
        tint="#FFF1E8"
        value={streak}
        label="gün seri"
        icon="flame"
        onPress={onStreak}
      />
      <Bubble
        delay={140}
        color={C.amber}
        tint="#FFF5E1"
        value={net}
        decimals
        trend={trend}
        label="son net"
        icon="chart"
        onPress={onNet}
      />
      <Bubble
        delay={220}
        color={C.purple}
        tint="#F1ECFE"
        value={xp}
        label={`${tier} · XP`}
        icon="trophy"
        onPress={onLeague}
      />
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
    borderWidth: 1,
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  value: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, letterSpacing: -0.6 },
  label: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold" },
});
