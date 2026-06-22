import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BentoCard, Stat, Chip, Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const RATE_MAP = {
  improving: { label: "Yükseliş trendi", icon: "trendUp", colorKey: "green" },
  declining: { label: "Düşüş trendi", icon: "trendDown", colorKey: "red" },
  stable: { label: "Stabil performans", icon: "minus", colorKey: "sec" },
};

export function PeriodSummary({ current, previous, diff, improvementRate }) {
  const C = useC();
  const rate = RATE_MAP[improvementRate] ?? RATE_MAP.stable;
  const accent = C[rate.colorKey];
  const isPositive = diff.avgNet >= 0;
  const diffColor = isPositive ? C.green : C.red;
  const sign = isPositive ? "+" : "";

  const gradient =
    improvementRate === "improving"
      ? [C.green + "12", C.surface, C.surface]
      : improvementRate === "declining"
        ? [C.red + "12", C.surface, C.surface]
        : [C.surface2 + "12", C.surface, C.surface];

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()}>
      <BentoCard gradient={gradient} accent={accent}>
        <Chip color={accent}>DÖNEM KARŞILAŞTIRMASI</Chip>

        <Stat size={48} color={C.text} style={{ marginTop: SPACING.md }}>
          {current.avgNet.toFixed(1)}
        </Stat>
        <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: SPACING.xs }]}>
          Dönem ortalaması
        </Text>

        <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg }}>
          <View style={miniBox(C)}>
            <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>Önceki dönem</Text>
            <Text style={[TYPOGRAPHY.subheading, { color: C.muted }]}>
              {previous.avgNet.toFixed(1)}
            </Text>
          </View>
          <View style={miniBox(C)}>
            <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>Değişim</Text>
            <Text style={[TYPOGRAPHY.subheading, { color: diffColor }]}>
              {sign}{diff.avgNet.toFixed(1)}
              {typeof diff.pct === "number" ? ` %${diff.pct.toFixed(0)}` : ""}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginTop: SPACING.md }}>
          <Icon name={rate.icon} size={16} color={accent} />
          <Text style={[TYPOGRAPHY.caption, { color: accent }]}>{rate.label}</Text>
        </View>

        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: SPACING.sm }]}>
          Bu dönem: {current.count} deneme · Önceki: {previous.count}
        </Text>
      </BentoCard>
    </Animated.View>
  );
}

const miniBox = (C) => ({
  flex: 1,
  backgroundColor: C.surface2,
  borderRadius: RADIUS.lg,
  padding: SPACING.md,
});
