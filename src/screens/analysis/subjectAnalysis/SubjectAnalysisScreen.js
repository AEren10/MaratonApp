import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { Icon, EmptyState } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { ScreenErrorBoundary } from "../../../components/common/ScreenErrorBoundary";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { SCREENS } from "../../../constants/screens";
import { selectTrials } from "../../../store/slices/trialSlice";
import { examTrials } from "../../../domain/exam/examScope";
import { subjectAnalysis, subjectAnalysisSentence } from "../../../domain/analysis/subjectAnalysis";
import { getSubjectLabel } from "../../../themes/subjects";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HeroMultiTrendChartSvg } from "../components/HeroMultiTrendChartSvg";
import { SubjectAnalysisStats } from "./SubjectAnalysisStats";

const signed = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${String(Math.abs(n)).replace(".", ",")}`;

// DERS ANALIZI: Analiz'deki ders kartindan acilir. Konu listesi (Mufredat)
// buradan bir dokunusla; kart eskiden dogrudan oraya gidiyordu.
export default function SubjectAnalysisScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { subjectKey, subjectName } = useRoute().params || {};
  const { examType, field } = useExam();
  const trials = useSelector(selectTrials);
  const a = useMemo(() => subjectAnalysis(examTrials(trials, examType, field), subjectKey), [trials, examType, field, subjectKey]);
  const name = subjectName || getSubjectLabel(subjectKey);
  // Ders rengi paletten (deneme anahtari tyt_matematik -> matematik).
  const color = C.subjects?.[subjectPaletteKey(subjectKey)] || C.accent;

  const links = [
    { label: "Konu ilerlemesi", note: "Konu konu çalışma durumu", go: () => navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey, subjectName: name }) },
    { label: "Yanlış defteri", note: "Bu dersin kaydettiğin yanlışları", go: () => navigation.navigate(SCREENS.WRONG_NOTEBOOK) },
    { label: "Deneme karşılaştır", note: "İki denemeyi ders ders yan yana koy", go: () => navigation.navigate(SCREENS.TRIAL_COMPARE) },
  ];

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={20} color={C.text2} />
          </Press>
          <View style={[s.dot, { backgroundColor: color }]} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>{name}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {!a.count ? (
            <EmptyState title="Bu ders için deneme yok" body="Deneme girdikçe netlerin burada çizilir." />
          ) : (
            <>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`SON ${a.count} DENEME`}</Text>
              <View style={s.hero}>
                <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{String(a.last).replace(".", ",")}</Text>
                {a.delta != null ? (
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: a.delta > 0 ? C.up : C.down }]}>{`${signed(a.delta)} net`}</Text>
                ) : null}
              </View>
              <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{subjectAnalysisSentence(a)}</Text>
              {a.points.length > 1 ? (
                <View style={s.chart}><HeroMultiTrendChartSvg C={C} series={[{ key: subjectKey, color, points: a.points }]} /></View>
              ) : null}
              <SubjectAnalysisStats C={C} a={a} />
            </>
          )}
          <View style={s.links}>
            {links.map((l) => (
              <Press key={l.label} haptic="none" onPress={l.go} accessibilityRole="button" style={[s.link, { borderBottomColor: C.line }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{l.label}</Text>
                  <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{l.note}</Text>
                </View>
                <Icon name="chevR" size={14} color={C.text3} />
              </Press>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, height: CONTROL.tapMin },
  dot: { width: 10, height: 10, borderRadius: 3 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  hero: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s1 },
  chart: { height: 180, marginTop: STEP.s3 },
  links: { marginTop: STEP.s4 },
  link: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderBottomWidth: 1, minHeight: CONTROL.tapMin },
});
