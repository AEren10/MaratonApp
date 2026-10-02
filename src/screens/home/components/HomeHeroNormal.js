import { useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeCTAButton } from "./HomeCTAButton";
import { RouteFeasibilityNote } from "../../../components/route/RouteFeasibilityNote";
import { HomeChartPager } from "./HomeChartPager";
import { HomeWeeklyMetrics } from "./HomeWeeklyMetrics";
import { WeeklyEffortChart } from "../../../components/charts/WeeklyEffortChart";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../../constants/screens";
import { formatNet } from "../../../lib/format";
import { TAB_KEYS } from "../../../navigation/tabAssignment";
import { openInTab } from "../../../navigation/tabJump";
import { HomeExamSeriesChart } from "./HomeExamSeriesChart";
import { PullForwardRow } from "./PullForwardRow";
import { useReplayOnFocus } from "../../../hooks/useReplayOnFocus";

// Ana Sayfa hero'sunun normal (Pro) hali: bugunun sayilari + rota / hafta
// grafigi (kahraman) + "Çalışmaya Başla". Rota ozet seridi grafikle ayni
// bilgiyi tekrar ediyordu, kaldirildi.
export function HomeHeroNormal({ solvedToday, dailyGoal, hero, onStartTask, onViewRoute, onViewWeek }) {
  const {
    remainingToGoal, daysUntilExam, examType, examDate, chartTarget, hasRouteAccess,
    chartData, declared, declaredAxis, weeklyEffort, todayIndex, examSeries,
    nextTask, ctaSubtitle,
  } = hero;
  const navigation = useNavigation();
  const C = useC();
  // Ana sayfaya donunce grafikler yeniden cizilir.
  const replay = useReplayOnFocus();

  // Varsayilan sayfa HAFTALIK: ana sayfa her gun aciliyor ve her gun sorulan
  // soru "bugun ilerledim mi". Rota haftada bir bakilan bir sey, ikinci
  // sayfada duruyor.
  // Her sayfa kendi detayina gider. Haftalik cubuklar zaten haftanin
  // kendisi; dokununca haftanin raporu acilir. O baglanti sayfanin
  // asagisinda bir metin satiri olarak duruyordu, grafigin ustunde olmali.
  const onPressPage = useCallback((key) => {
    if (key === "route" && hasRouteAccess) onViewRoute?.();
    else if (key === "week") onViewWeek?.();
    else if (key === "exams") openInTab(navigation, TAB_KEYS.ANALIZ, SCREENS.ANALYSIS);
  }, [hasRouteAccess, onViewRoute, onViewWeek, navigation]);

  // Cumle sayfanin ICINDE tasiniyor: disarida dururken bir sayfada var bir
  // sayfada yok oluyor ve kaydirirken altindaki her sey bir satir zipliyordu.
  const pages = [
    {
      key: "week",
      hint: "Dokun · geçmişi gör",
      a11y: weeklyEffort?.summary ? `${weeklyEffort.summary}. Çalışma geçmişini aç` : "Çalışma geçmişini aç",
      render: () => <WeeklyEffortChart week={weeklyEffort} todayIndex={todayIndex} />,
      renderFooter: () => <HomeWeeklyMetrics weeklyEffort={weeklyEffort} />,
    },
    {
      key: "route",
      hint: "Dokun · rota detayı",
      a11y: "Rota detayını gör",
      caption: chartData?.sentence || declared?.summary || null,
      render: () => (
        <HomeHeroChart
          hasAccess={hasRouteAccess}
          data={chartData}
          declared={declared}
          declaredAxis={declaredAxis}
          target={chartTarget}
        />
      ),
    },
    // Iki sinavli kullanicida TYT ve AYT ayri cizgi (toplanmaz).
    ...(examSeries ? [{
      key: "exams",
      hint: "Dokun · Analiz'de aç",
      a11y: "TYT ve AYT netlerini Analiz'de aç",
      caption: examSeries.map((line) => `${line.key} ${formatNet(line.points[line.points.length - 1].v)}`).join(" · ") + " son denemede",
      render: () => <HomeExamSeriesChart series={examSeries} />,
    }] : []),
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
        <HomeChartPager key={`pager-${replay}`} pages={pages} onPressPage={onPressPage} />
      </View>

      <Animated.View style={s.cta}>
        <HomeCTAButton
          title={nextTask ? "Çalışmaya Başla" : hero.doneCta ? hero.doneCta.title : "Bugüne durak ekle"}
          subtitle={nextTask ? ctaSubtitle : hero.doneCta ? hero.doneCta.subtitle : null}
          onPress={() => onStartTask?.(nextTask)}
        />
        {hero.ctaHint ? (
          <Text style={[TYPOGRAPHY.meta, s.hint, { color: C.text3 }]} numberOfLines={1}>{hero.ctaHint}</Text>
        ) : null}
        <PullForwardRow stop={hero.pullStop} />
      </Animated.View>
      <RouteFeasibilityNote note={hero.feasibility} style={s.note} />
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s3 + 2 },
  chart: { marginTop: -STEP.s2, marginBottom: STEP.s2 },
  cta: { marginTop: STEP.s4 },
  note: { marginTop: STEP.s3 },
  hint: { marginTop: STEP.s1, textAlign: "center" },
});

