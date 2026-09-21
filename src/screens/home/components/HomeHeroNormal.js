import { Pressable, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { STEP } from "../../../themes/tokens";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeCTAButton } from "./HomeCTAButton";

// Ana Sayfa hero'sunun normal (Pro) hali: dev sayi + rota grafigi + ozet
// seridi + "Çalışmaya Başla". HomeHero'nun eski normal dali buraya tasindi.
export function HomeHeroNormal({ solvedToday, dailyGoal, hero, onStartTask, onViewRoute, onViewFullRoute }) {
  const { remainingToGoal, daysUntilExam, examType, targetNet, hasRouteAccess, chartData, declared, stopCounts, debtHours, nextTask, ctaSubtitle } = hero;
  return (
    <View style={s.top}>
      <HomeHeroStat
        solved={solvedToday}
        goal={dailyGoal}
        remainingToGoal={remainingToGoal}
        daysUntilExam={daysUntilExam}
        examType={examType}
      />

      <Pressable style={s.chart} onPress={onViewRoute} disabled={!hasRouteAccess}
        accessibilityRole="button" accessibilityLabel="Rota detayını gör">
        <HomeHeroChart hasAccess={hasRouteAccess} data={chartData} declared={declared} target={targetNet} />
      </Pressable>

      <HomeRouteSummaryBar
        hasAccess={hasRouteAccess}
        total={stopCounts.total}
        done={stopCounts.done}
        debtHours={debtHours}
        onPress={stopCounts.total > 0 && onViewFullRoute ? onViewFullRoute : onViewRoute}
      />

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.cta}>
        <HomeCTAButton
          title={nextTask ? "Çalışmaya Başla" : "İlk durağını ekle"}
          subtitle={ctaSubtitle}
          onPress={() => onStartTask?.(nextTask)}
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s3 + 2 },
  chart: { marginTop: STEP.s3, marginBottom: STEP.s2 },
  cta: { marginTop: STEP.s4 },
});
