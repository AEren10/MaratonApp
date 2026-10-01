import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { examTrials } from "../../domain/exam/examScope";
import { buildPublisherComparison } from "../../domain/analysis/publisherComparison";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { Icon, EmptyState } from "../../components/design";
import { Press } from "../../components/design/Press";
import { StatsStrip } from "../../components/design/StatsStrip";
import { GUTTER, STEP, TYPOGRAPHY, NAV_ICON } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { PublisherDetailRows, PublisherInsightBlock } from "./components/PublisherDetailRows";

function PublisherDetailContent() {
  const C = useC();
  const navigation = useNavigation();
  const { examType, field } = useExam();
  const allTrials = useSelector(selectTrials);
  const trials = useMemo(() => examTrials(allTrials, examType, field), [allTrials, examType, field]);
  const comparison = useMemo(() => buildPublisherComparison(trials), [trials]);

  if (!comparison?.ready) {
    return (
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={s.backBtn}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Yayın Karşılaştırması</Text>
        </View>
        <EmptyState
          eyebrow="YAYIN ANALİZİ"
          title="Yeterli yayın verisi yok"
          body="Karşılaştırma için en az iki farklı yayından deneme sonucu girmiş olmalısın."
          primary="Deneme Gir"
          onPrimary={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
          style={{ paddingHorizontal: GUTTER, marginTop: STEP.s4 }}
        />
      </SafeAreaView>
    );
  }

  const publishers = comparison.publishers;
  const best = publishers[0];
  const lowest = publishers[publishers.length - 1];
  const spread = Math.round((best.net - lowest.net) * 10) / 10;

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={s.backBtn}>
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Yayın Karşılaştırması</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.introWrap}>
          <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>YAYIN ORTALAMALARI</Text>
          <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s1 }]}>Hangi yayında kaç net?</Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
            Farklı yayınların zorluk dereceleri değiştikçe netlerin dalgalanabilir. Rota ve tempo planında normalize net baz alınır.
          </Text>
        </View>

        <StatsStrip
          C={C}
          cells={[
            { value: String(publishers.length), label: "Yayın" },
            { value: String(best.net).replace(".", ","), label: "En Yüksek" },
            { value: `${spread > 0 ? "+" : ""}${String(spread).replace(".", ",")}`, label: "Net Farkı" },
          ]}
          style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 }}
        />

        <PublisherDetailRows C={C} publishers={publishers} />
        <PublisherInsightBlock C={C} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PublisherDetailScreen() {
  return (
    <ScreenErrorBoundary>
      <PublisherDetailContent />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    gap: STEP.s2,
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: STEP.s5,
  },
  introWrap: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
});
