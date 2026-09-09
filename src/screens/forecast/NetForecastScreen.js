import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials, selectTYTTrials, selectAYTTrials, selectLGSTrials } from "../../store/slices/trialSlice";
import { useExam } from "../../contexts/ExamContext";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { forecastNet, forecastBySubject } from "../../lib/netForecast";
import { estimateRank, RANKING_DISCLAIMER } from "../../data/rankingTable";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { ForecastRankCard } from "./components/ForecastRankCard";
import { ForecastHero } from "./components/ForecastHero";
import { TempoScenarioSection } from "./components/TempoScenarioSection";
import { TrajectoryChart } from "./components/TrajectoryChart";
import { SubjectForecast } from "./components/SubjectForecast";


export default function NetForecastScreen() {
  const navigation = useNavigation();
  const C = useC();
  const trials = useSelector(selectTrials);
  const { examDate, field, examType } = useExam();

  const tytTrials = useSelector(selectTYTTrials);
  const aytTrials = useSelector(selectAYTTrials);
  const lgsTrials = useSelector(selectLGSTrials);
  const { tempoScenarios, hasRouteAccess } = useStudyRoute({ persist: false });

  // Manşet tahmin TEK bir deneme tipinden hesaplanmalı. Önceden tüm denemeler
  // (TYT 120 net, AYT 80, LGS 90, tek derslik branş) aynı regresyona giriyordu;
  // tip değiştikçe net doğal olarak düşüp yükseldiği için trend anlamsız çıkıyor
  // ve "sınav günü 0 net" gibi sonuçlar üretebiliyordu.
  const { primaryTrials, primaryMax, primaryType } = useMemo(() => {
    const groups = examType === "lgs"
      ? [{ list: lgsTrials, max: 90, type: "LGS" }]
      : [{ list: tytTrials, max: 120, type: "TYT" }, { list: aytTrials, max: 80, type: null }];
    const usable = groups.find((g) => g.list.length >= 3);
    const chosen = usable || groups.reduce((a, b) => (b.list.length > a.list.length ? b : a));
    return { primaryTrials: chosen.list, primaryMax: chosen.max, primaryType: chosen.type };
  }, [examType, lgsTrials, tytTrials, aytTrials]);

  const forecast = useMemo(
    () => forecastNet(primaryTrials, examDate, primaryMax, primaryType),
    [primaryTrials, examDate, primaryMax, primaryType],
  );
  const tytForecast = useMemo(() => forecastNet(tytTrials, examDate, 120), [tytTrials, examDate]);
  const aytForecast = useMemo(() => forecastNet(aytTrials, examDate, 80), [aytTrials, examDate]);
  const subjects = useMemo(() => forecastBySubject(trials, examDate), [trials, examDate]);

  const type = field === "sayisal" ? "say" : field === "sozel" ? "soz" : field === "ea" ? "ea" : "say";
  const projectedRank = useMemo(() => {
    if (!tytForecast && !aytForecast) return null;
    return estimateRank({
      tytNet: tytForecast?.projected ?? 0,
      aytNet: aytForecast?.projected ?? 0,
      type,
    });
  }, [tytForecast, aytForecast, type]);
  const currentRank = useMemo(() => {
    if (!tytForecast && !aytForecast) return null;
    return estimateRank({
      tytNet: tytForecast?.current ?? 0,
      aytNet: aytForecast?.current ?? 0,
      type,
    });
  }, [tytForecast, aytForecast, type]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, marginLeft: SPACING.md }}>
          Net Tahmini
        </Text>
      </View>

      {!forecast ? (
        <EmptyState
          icon="trendUp"
          title="Tahmin için veriye ihtiyacın var"
          message="En az 3 deneme girdiğinde sınav günü net tahminin burada görünecek."
          actionLabel="Deneme Gir"
          onAction={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
          color="accent"
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <ForecastHero
            projected={forecast.projected}
            current={forecast.current}
            daysLeft={forecast.daysLeft}
            confidence={forecast.confidence}
            range={forecast.range}
            weeklyGain={forecast.weeklyGain}
          />

          <ForecastRankCard projectedRank={projectedRank} currentRank={currentRank} />
          {hasRouteAccess ? <TempoScenarioSection scenarios={tempoScenarios} /> : null}

          <View style={{ marginTop: SPACING.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md }}>
              <Icon name="trendUp" size={18} color={C.sec} />
              <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Net Yörüngesi</Text>
            </View>
            <TrajectoryChart
              dataPoints={forecast.dataPoints}
              projectionEnd={forecast.projectionEnd}
              range={forecast.range}
            />
          </View>

          {subjects.length > 0 && (
            <View style={{ marginTop: SPACING.xl }}>
              <SubjectForecast subjects={subjects} />
            </View>
          )}

          {/* Dipnot YKS sıralamasından bahsediyor; sıralama kartı LGS'de zaten
              gösterilmiyor, dipnot da onunla birlikte gizlensin. */}
          {projectedRank ? (
            <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, textAlign: "center", marginTop: SPACING.xl, lineHeight: 16 }}>
              {RANKING_DISCLAIMER}
            </Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
