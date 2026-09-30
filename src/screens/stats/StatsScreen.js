import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, EmptyState, Skeleton, SectionLabel } from "../../components/design";
import { Press } from "../../components/design/Press";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useStatsOverview } from "../../hooks/useStatsOverview";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY, NAV_ICON } from "../../themes/tokens";
import { EXAM_NAME, fmtHours, fmtInt, fmtNet, weekLabel } from "./statsFormat";
import { StatsStrip } from "../../components/design/StatsStrip";
import { StatsWeeks } from "./components/StatsWeeks";
import { StatsSubjects } from "./components/StatsSubjects";
import { statsStory } from "../../domain/insight/storyLines";
import { CountUpText } from "../../components/design/CountUpText";

// ISTATISTIKLERIM: Ders analizi deseni (tek buyuk sayi, tek cumle, 4'lu serit, kutusuz).
export default function StatsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { data, loading, isEmpty } = useStatsOverview();
  const study = data?.study;
  const trials = data?.trials;

  const bestWeekLabel = useMemo(() => {
    if (!study?.bestWeek) return null;
    return `${weekLabel(study.bestWeek.weekStart, { long: true })} haftası`;
  }, [study?.bestWeek]);

  const story = useMemo(() => {
    const weeks = (study?.last8Weeks || []).map((w) => w.minutes || 0);
    return statsStory({ weeks, bestWeekLabel });
  }, [study?.last8Weeks, bestWeekLabel]);

  const totalHours = fmtHours(study?.totalMinutes);
  const bestWeekStat = study?.bestWeek ? `${fmtHours(study.bestWeek.minutes)} sa` : "—";

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>İstatistiklerim</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {loading && !data ? (
            <Skeleton width="100%" height={120} radius={SHAPE.card} />
          ) : isEmpty ? (
            <EmptyState title="Henüz istatistik yok" body="Çalışma ve deneme kaydettikçe burası dolar." />
          ) : (
            <>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>TÜM ZAMANLAR</Text>
              <View style={s.heroRow}>
                {study?.totalMinutes == null ? (
                  <Text style={[TYPOGRAPHY.stat, s.num, { color: C.text }]}>{totalHours}</Text>
                ) : (
                  <CountUpText value={study.totalMinutes / 60} decimals={study.totalMinutes >= 600 ? 0 : 1} style={[TYPOGRAPHY.stat, s.num, { color: C.text }]} />
                )}
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>saat</Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{story}</Text>

              <StatsStrip C={C} cells={[
                { value: fmtInt(study?.totalQuestions), label: "Soru" },
                { value: fmtInt(study?.activeDays), label: "Aktif gün" },
                { value: trials?.count ? String(trials.count) : "0", label: "Deneme" },
                { value: bestWeekStat, label: "En iyi hafta" },
              ]} style={{ marginTop: STEP.s4 }} />

              {study?.last8Weeks?.length ? (
                <View style={s.block}>
                  <SectionLabel>SON 8 HAFTA</SectionLabel>
                  <StatsWeeks C={C} weeks={study.last8Weeks} bestWeekStart={study.bestWeek?.weekStart} />
                </View>
              ) : null}

              {study?.subjects?.length ? (
                <View style={s.block}>
                  <SectionLabel>DERSLER</SectionLabel>
                  <StatsSubjects C={C} subjects={study.subjects} />
                </View>
              ) : null}

              {trials ? (
                <View style={s.block}>
                  <SectionLabel>DENEMELER</SectionLabel>
                  <Text style={[TYPOGRAPHY.body, s.note, { color: C.text2 }]}>{`${fmtInt(trials.count)} deneme girdin.`}</Text>
                  {(trials.bestByType || []).map((row) => (
                    <View key={row.examType} style={[s.trialRow, { borderBottomColor: C.line }]}>
                      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{EXAM_NAME[row.examType] || row.examType}</Text>
                      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{row.count ? `${row.count} deneme · ` : ""}</Text>
                      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{`en iyi ${fmtNet(row.bestNet)}`}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, height: CONTROL.tapMin },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: STEP.s1 },
  num: { fontVariant: ["tabular-nums"] },
  block: { marginTop: STEP.s4 },
  note: { marginTop: STEP.s2 },
  trialRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, paddingVertical: STEP.s2, borderBottomWidth: 1 },
});
