import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { STEP } from "../../../themes/tokens";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeCTAButton } from "./HomeCTAButton";
import { HomeChartPager } from "./HomeChartPager";
import { WeeklyEffortChart } from "../../../components/charts/WeeklyEffortChart";

// Ana Sayfa hero'sunun normal (Pro) hali: dev sayi + rota grafigi + ozet
// seridi + "Çalışmaya Başla". HomeHero'nun eski normal dali buraya tasindi.
export function HomeHeroNormal({ solvedToday, dailyGoal, hero, onStartTask, onViewRoute, onViewFullRoute, onViewWeek }) {
  const {
    remainingToGoal, daysUntilExam, examType, examDate, targetNet, hasRouteAccess,
    chartData, declared, declaredAxis, weeklyEffort, todayIndex,
    stopCounts, debtHours, nextTask, ctaSubtitle,
  } = hero;

  // Varsayilan sayfa HAFTALIK: ana sayfa her gun aciliyor ve her gun sorulan
  // soru "bugun ilerledim mi". Rota haftada bir bakilan bir sey, ikinci
  // sayfada duruyor.
  // Her sayfa kendi detayina gider. Haftalik cubuklar zaten haftanin
  // kendisi; dokununca haftanin raporu acilir. O baglanti sayfanin
  // asagisinda bir metin satiri olarak duruyordu, grafigin ustunde olmali.
  const onPressPage = useCallback((key) => {
    if (key === "route" && hasRouteAccess) onViewRoute?.();
    else if (key === "week") onViewWeek?.();
  }, [hasRouteAccess, onViewRoute, onViewWeek]);

  // Cumle sayfanin ICINDE tasiniyor: disarida dururken bir sayfada var bir
  // sayfada yok oluyor ve kaydirirken altindaki her sey bir satir zipliyordu.
  const pages = [
    {
      key: "week",
      a11y: weeklyEffort?.summary ? `${weeklyEffort.summary}. Çalışma geçmişini aç` : "Çalışma geçmişini aç",
      caption: weeklyEffort?.summary || null,
      render: () => <WeeklyEffortChart week={weeklyEffort} todayIndex={todayIndex} />,
    },
    {
      key: "route",
      a11y: "Rota detayını gör",
      caption: chartData?.sentence || declared?.summary || null,
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
        <HomeChartPager pages={pages} onPressPage={onPressPage} />
      </View>

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
  chart: { marginTop: -STEP.s2, marginBottom: STEP.s2 },
  cta: { marginTop: STEP.s4 },
});

