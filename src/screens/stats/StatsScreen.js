import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, EmptyState, Skeleton, SectionLabel } from "../../components/design";
import { Press } from "../../components/design/Press";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useStatsOverview } from "../../hooks/useStatsOverview";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { EXAM_NAME, fmtHours, fmtInt, fmtNet, weekLabel } from "./statsFormat";
import { StatsTotals } from "./components/StatsTotals";
import { StatsWeeks } from "./components/StatsWeeks";
import { StatsSubjects } from "./components/StatsSubjects";

// ISTATISTIKLERIM: tum zamanlarin toplami, son 8 hafta, dersler ve denemeler.
// Veri sunucudan (get_study_totals) ve yalniz aktif sinavin denemeleri.
export default function StatsScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { data, loading, isEmpty } = useStatsOverview();
  const study = data?.study;
  const trials = data?.trials;

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={20} color={C.text2} />
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
              <SectionLabel>TÜM ZAMANLAR</SectionLabel>
              <StatsTotals C={C} study={study} />
              {study?.bestWeek ? (
                <Text style={[TYPOGRAPHY.meta, s.note, { color: C.text2 }]}>
                  {`En iyi haftan: ${weekLabel(study.bestWeek.weekStart, { long: true })} haftası · ${fmtInt(study.bestWeek.questions)} soru · ${fmtHours(study.bestWeek.minutes)} sa`}
                </Text>
              ) : null}

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
  block: { marginTop: STEP.s4 },
  note: { marginTop: STEP.s2 },
  trialRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, paddingVertical: STEP.s2, borderBottomWidth: 1 },
});
