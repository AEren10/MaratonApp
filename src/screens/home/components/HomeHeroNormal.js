import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeCTAButton } from "./HomeCTAButton";
import { HomeChartPager } from "./HomeChartPager";
import { WeeklyEffortChart } from "../../../components/charts/WeeklyEffortChart";

// Ana Sayfa hero'sunun normal (Pro) hali: dev sayi + rota grafigi + ozet
// seridi + "Çalışmaya Başla". HomeHero'nun eski normal dali buraya tasindi.
export function HomeHeroNormal({ solvedToday, dailyGoal, hero, onStartTask, onViewRoute, onViewFullRoute }) {
  const C = useC();
  const {
    remainingToGoal, daysUntilExam, examType, examDate, targetNet, hasRouteAccess,
    chartData, declared, declaredAxis, weeklyEffort, todayIndex,
    stopCounts, debtHours, nextTask, ctaSubtitle,
  } = hero;

  // Varsayilan sayfa HAFTALIK: ana sayfa her gun aciliyor ve her gun sorulan
  // soru "bugun ilerledim mi". Rota haftada bir bakilan bir sey, ikinci
  // sayfada duruyor.
  const [page, setPage] = useState("week");
  const onPressPage = useCallback((key) => {
    if (key === "route" && hasRouteAccess) onViewRoute?.();
  }, [hasRouteAccess, onViewRoute]);

  const pages = [
    {
      key: "week",
      a11y: weeklyEffort?.summary || "Bu hafta",
      render: () => <WeeklyEffortChart week={weeklyEffort} todayIndex={todayIndex} />,
    },
    {
      key: "route",
      a11y: "Rota detayını gör",
      render: () => (
        <HomeHeroChart
          hasAccess={hasRouteAccess}
          data={chartData}
          declared={declared}
          declaredAxis={declaredAxis}
          target={targetNet}
        />
      ),
    },
  ];

  // Altindaki cumle acik olan sayfayi anlatir: haftalik sayfada emek ozeti,
  // rota sayfasinda tahmin cumlesi. Yoksa satir hic cizilmez.
  const caption = page === "week"
    ? weeklyEffort?.summary
    : (chartData?.sentence || declared?.summary || null);
  return (
    <View style={s.top}>
      <HomeHeroStat
        solved={solvedToday}
        goal={dailyGoal}
        remainingToGoal={remainingToGoal}
        daysUntilExam={daysUntilExam}
        examType={examType}
        examDate={examDate}
      />

      <View style={s.chart}>
        <HomeChartPager pages={pages} onPressPage={onPressPage} onPageChange={setPage} />
      </View>

      {caption ? (
        <Text style={[TYPOGRAPHY.body, s.sentence, { color: C.text2 }]}>{caption}</Text>
      ) : null}

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
  // Tasarimda grafigin ucu "hedefe X kaldı" satirinin USTUNE tasiyor:
  // hat ile kahraman sayi ayni dusey alani paylasiyor. Hattin sol ust
  // kosesi bos oldugu icin metinle cakismiyor.
  chart: { marginTop: -STEP.s4, marginBottom: STEP.s2 },
  sentence: { marginBottom: STEP.s2 },
  cta: { marginTop: STEP.s4 },
});
