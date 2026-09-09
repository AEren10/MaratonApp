import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { GlassCard, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const LABELS = {
  less: "Haftada %10 daha az",
  current: "Mevcut tempo",
  more: "Haftada %10 daha fazla",
};

const CONFIDENCE = {
  high: "yüksek güven",
  medium: "orta güven",
  low: "düşük güven",
};

function ScenarioRow({ item }) {
  const C = useC();
  const positive = item.deltaNet > 0;
  const accent = item.id === "more" ? C.green : item.id === "less" ? C.amber : C.accent;

  return (
    <View style={{ paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: C.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: SPACING.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>{LABELS[item.id]}</Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.xs }}>
            {item.questionsPerWeek} soru/hafta · {item.minutesPerDayDelta >= 0 ? "+" : ""}
            {item.minutesPerDayDelta.toFixed(1)} dk/gün
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ ...TYPOGRAPHY.statSmall, color: accent }}>
            {item.projectedNet.toFixed(1)}
          </Text>
          <Text style={{ ...TYPOGRAPHY.micro, color: positive ? C.green : item.deltaNet < 0 ? C.red : C.sec }}>
            {item.deltaNet >= 0 ? "+" : ""}{item.deltaNet.toFixed(1)} net
          </Text>
        </View>
      </View>
      <Text style={{ ...TYPOGRAPHY.micro, color: C.sec, marginTop: SPACING.xs }}>
        Bant {item.range.low.toFixed(0)}-{item.range.high.toFixed(0)} · {CONFIDENCE[item.confidence]}
      </Text>
    </View>
  );
}

export function TempoScenarioSection({ scenarios }) {
  const C = useC();
  if (!scenarios?.length) return null;

  return (
    <Animated.View entering={FadeInDown.delay(160).duration(420).springify()}>
      <GlassCard radius={RADIUS.xxl} style={{ marginTop: SPACING.lg, padding: SPACING.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.xs }}>
          <Icon name="target" size={18} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Tempo Senaryoları</Text>
        </View>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginBottom: SPACING.sm }}>
          Sınav günü net tahmini ve güven bandı
        </Text>
        {scenarios.map((item) => <ScenarioRow key={item.id} item={item} />)}
      </GlassCard>
    </Animated.View>
  );
}
