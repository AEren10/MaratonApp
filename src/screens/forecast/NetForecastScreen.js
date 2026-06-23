import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials, selectTYTTrials, selectAYTTrials } from "../../store/slices/trialSlice";
import { useExam } from "../../contexts/ExamContext";
import { useC } from "../../contexts/ThemeContext";
import { Icon, GlassCard } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { forecastNet, forecastBySubject } from "../../lib/netForecast";
import { estimateRank, RANKING_DISCLAIMER } from "../../data/rankingTable";
import { ForecastHero } from "./components/ForecastHero";
import { TrajectoryChart } from "./components/TrajectoryChart";
import { SubjectForecast } from "./components/SubjectForecast";

const fmt = (n) => n.toLocaleString("tr-TR");

export default function NetForecastScreen() {
  const navigation = useNavigation();
  const C = useC();
  const trials = useSelector(selectTrials);
  const { examDate, field } = useExam();

  const tytTrials = useSelector(selectTYTTrials);
  const aytTrials = useSelector(selectAYTTrials);

  const forecast = useMemo(() => forecastNet(trials, examDate), [trials, examDate]);
  const tytForecast = useMemo(() => forecastNet(tytTrials, examDate), [tytTrials, examDate]);
  const aytForecast = useMemo(() => forecastNet(aytTrials, examDate), [aytTrials, examDate]);
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
          message="En az 2 deneme girdiğinde sınav günü net tahminin burada görünecek."
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

          {projectedRank && (
            <Animated.View entering={FadeInDown.delay(100).duration(420).springify()}>
              <GlassCard radius={RADIUS.xxl} style={{ marginTop: SPACING.lg, padding: SPACING.lg }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ ...TYPOGRAPHY.label, color: C.sec, letterSpacing: 0.6 }}>TAHMİNİ SIRALAMA</Text>
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: C.accent, marginTop: SPACING.xs }}>
                      ~{fmt(projectedRank)}
                    </Text>
                  </View>
                  {currentRank && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>Şu anki</Text>
                      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: C.sec }}>
                        ~{fmt(currentRank)}
                      </Text>
                      {currentRank !== projectedRank && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <Icon
                            name={projectedRank < currentRank ? "trendUp" : "trendDown"}
                            size={11}
                            color={projectedRank < currentRank ? C.green : C.red}
                          />
                          <Text style={{ ...TYPOGRAPHY.micro, color: projectedRank < currentRank ? C.green : C.red }}>
                            {fmt(Math.abs(currentRank - projectedRank))} sıra
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          )}

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

          <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, textAlign: "center", marginTop: SPACING.xl, lineHeight: 16 }}>
            {RANKING_DISCLAIMER}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
