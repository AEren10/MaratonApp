import { View, Text } from "react-native";

import { Icon, GlassCard, Stat, Trend, Chip, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { LatestScore } from "./LatestScore";

export function AnalysisOverviewSection({ C, analysis, filter }) {
  return (
    <>
      <SectionLabel>GENEL</SectionLabel>
      {filter === "ALL" && analysis.typeBreakdown?.length > 1 ? (
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          {analysis.typeBreakdown.map((breakdown) => (
            <AnimatedCard key={breakdown.type} delay={80} style={{ flex: 1 }}>
              <GlassCard style={{ padding: SPACING.lg, alignItems: "center", gap: SPACING.sm }}>
                <Chip color={breakdown.color}>{breakdown.label}</Chip>
                <Stat size={36} color={C.text}>{breakdown.net}</Stat>
                <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }}>toplam net</Text>
                <Trend v={breakdown.trend} size={12} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Icon name="calendar" size={11} color={C.muted} />
                  <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{breakdown.date}</Text>
                </View>
              </GlassCard>
            </AnimatedCard>
          ))}
        </View>
      ) : (
        <AnimatedCard delay={80}>
          <LatestScore
            net={analysis.latest.net}
            trend={analysis.latest.trend}
            date={analysis.latest.date}
            typeLabel={analysis.latest.typeLabel}
          />
        </AnimatedCard>
      )}
    </>
  );
}
