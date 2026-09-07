import { View } from "react-native";

import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { SPACING } from "../../../themes/tokens";
import { WeeklyReportCard } from "./WeeklyReportCard";
import { WeeklyTrialCard } from "./WeeklyTrialCard";
import { WrappedBanner } from "./WrappedBanner";

export function HomeWeeklySection({
  onWeeklyReview,
  onWeeklyTrialReview,
  weeklyReport,
  weeklyTrialReport,
  wrappedPeriod,
  wrappedStats,
}) {
  const day = new Date().getDay();
  const showWeekly = day === 0 || day === 1 || day === 5 || day === 6;
  if (!showWeekly && !(wrappedStats && wrappedPeriod)) return null;

  return (
    <View style={{ marginTop: SPACING.xxl, gap: SPACING.sm }}>
      {showWeekly && (
        <>
          <AnimatedCard delay={160}>
            <WeeklyReportCard report={weeklyReport} onPress={onWeeklyReview} />
          </AnimatedCard>
          <AnimatedCard delay={180}>
            <WeeklyTrialCard report={weeklyTrialReport} onPress={onWeeklyTrialReview} />
          </AnimatedCard>
        </>
      )}
      {wrappedStats && wrappedPeriod && (
        <AnimatedCard delay={220}>
          <WrappedBanner stats={wrappedStats} period={wrappedPeriod} />
        </AnimatedCard>
      )}
    </View>
  );
}
