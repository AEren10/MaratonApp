import { View, Text } from "react-native";

import { Icon, Card, StatBlock, Trend, Chip, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { LatestScore } from "./LatestScore";

export function AnalysisOverviewSection({ C, analysis, filter }) {
  return (
    <>
      <SectionLabel>GENEL</SectionLabel>
      {filter === "ALL" && analysis.typeBreakdown?.length > 1 ? (
        <View style={{ flexDirection: "row", gap: STEP.s1 }}>
          {analysis.typeBreakdown.map((breakdown) => (
            <AnimatedCard key={breakdown.type} delay={80} style={{ flex: 1 }}>
              <Card tone="surface" radius="sheet" style={{ padding: STEP.s3, alignItems: "center", gap: STEP.s1 }}>
                <Chip color={breakdown.color}>{breakdown.label}</Chip>
                <StatBlock value={breakdown.net} size="value" color={C.text} align="center" />
                <Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>toplam net</Text>
                <Trend v={breakdown.trend} size={12} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Icon name="calendar" size={11} color={C.text3} />
                  <Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>{breakdown.date}</Text>
                </View>
              </Card>
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
