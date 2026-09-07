import { View, Text, Pressable } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TrendChart } from "../../../components/charts/TrendChart";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function AnalysisTrendSection({ C, analysis, filter, go, screens }) {
  if (!analysis.heroLine || analysis.heroLine.length <= 1) return null;

  return (
    <View>
      <SectionLabel>TREND</SectionLabel>
      <AnimatedCard delay={0}>
        <TrendChart
          data={analysis.heroLine}
          labels={analysis.heroLabels}
          title="Net Trendin"
          color={C.accent}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Detaylı Analiz"
          accessibilityHint="Deneme trendlerinin detaylı analizine gider"
          onPress={() => go(screens.TRIAL_INSIGHTS, { initialFilter: filter }, "analysis_trial_insights")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: SPACING.lg,
            paddingVertical: 12,
            paddingHorizontal: SPACING.lg,
            backgroundColor: C.accent + "18",
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: C.accent + "30",
          }}
        >
          <Icon name="trendUp" size={16} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.accent }}>Detaylı Analiz</Text>
          <Icon name="chevR" size={14} color={C.accent} />
        </Pressable>
      </AnimatedCard>
    </View>
  );
}
