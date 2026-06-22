import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BentoCard, Stat, Chip } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const CONF = {
  high:   { label: "Yüksek güven",  key: "green" },
  medium: { label: "Orta güven",    key: "amber" },
  low:    { label: "Düşük güven",   key: "red" },
};

export function ForecastHero({ projected, current, daysLeft, confidence, range, weeklyGain }) {
  const C = useC();

  const conf = CONF[confidence] || CONF.medium;
  const confColor = C[conf.key];
  const gainColor = weeklyGain >= 0 ? C.green : C.red;

  const miniBox = {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
  };

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()}>
      <BentoCard
        gradient={[C.accent + "18", C.surface, C.surface]}
        accent={C.accent}
      >
        <Chip color={C.accent}>TAHMİNİ NET</Chip>

        <View style={{ alignItems: "center", marginTop: SPACING.lg, marginBottom: SPACING.md }}>
          <Stat size={52} color={C.text}>
            {projected.toFixed(1)}
          </Stat>
          <Text style={[TYPOGRAPHY.body, { color: C.sec, marginTop: SPACING.xs }]}>
            Sınav günü tahminin
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md }}>
          <View style={miniBox}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted, fontSize: 12 }]}>Şu an</Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, marginTop: SPACING.xs }]}>
              {current.toFixed(1)}
            </Text>
          </View>
          <View style={miniBox}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted, fontSize: 12 }]}>Haftalık</Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: gainColor, marginTop: SPACING.xs }]}>
              {weeklyGain >= 0 ? "+" : ""}{weeklyGain.toFixed(1)}
            </Text>
          </View>
          <View style={miniBox}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted, fontSize: 12 }]}>Kalan</Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, marginTop: SPACING.xs }]}>
              {daysLeft} gün
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View
            style={{
              backgroundColor: confColor + "20",
              borderRadius: RADIUS.pill,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
            }}
          >
            <Text style={[TYPOGRAPHY.bodyMedium, { color: confColor, fontSize: 13 }]}>
              {conf.label}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted, fontSize: 13 }]}>
            {range.low.toFixed(0)} – {range.high.toFixed(0)} arası
          </Text>
        </View>
      </BentoCard>
    </Animated.View>
  );
}
