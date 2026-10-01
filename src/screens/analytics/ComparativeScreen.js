import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { useC } from "../../contexts/ThemeContext";
import { Icon, Skeleton } from "../../components/design";
import { ErrorState } from "../../components/design/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { ScreenDepth } from "../../components/design/ScreenDepth";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import SegmentTabs from "../../components/common/SegmentTabs";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, SHAPE } from "../../themes/tokens";
import { useSync } from "../../contexts/DataSyncContext";
import { comparePeriods, subjectComparison, personalBests, consistencyScore } from "../../lib/comparativeAnalytics";
import { PeriodSummary } from "./components/PeriodSummary";
import { SubjectProgress } from "./components/SubjectProgress";
import { PersonalBests } from "./components/PersonalBests";
import { Press } from "../../components/design/Press";

const PERIOD_OPTIONS = [
  { key: 7, label: "Hafta" },
  { key: 30, label: "Ay" },
  { key: 90, label: "3 Ay" },
];

function ComparativeContent() {
  const navigation = useNavigation();
  const C = useC();
  const trials = useSelector(selectTrials);
  const { syncedOnce, error: syncError, refresh } = useSync();
  const readError = syncError?.sourceKeys?.includes("trials") ? syncError : null;
  const [periodDays, setPeriodDays] = useState(30);

  const period = useMemo(() => comparePeriods(trials, periodDays), [trials, periodDays]);
  const subjects = useMemo(() => subjectComparison(trials, periodDays), [trials, periodDays]);
  const bests = useMemo(() => personalBests(trials), [trials]);
  const consistency = useMemo(() => consistencyScore(trials, periodDays), [trials, periodDays]);

  const handlePeriod = useCallback((days) => setPeriodDays(days), []);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <ScreenDepth />
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={s.backBtn}>
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>
          Dönem Karşılaştırması
        </Text>
      </View>

      {trials.length === 0 && !syncedOnce && !readError ? (
        <View style={s.loadingWrap}>
          <Skeleton width="100%" height={96} radius={SHAPE.card} />
          <Skeleton width="100%" height={146} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
          <Skeleton width="100%" height={146} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
        </View>
      ) : readError ? (
        <View style={s.loadingWrap}>
          <ErrorState preset="server" onPrimary={refresh} code={readError.code} />
        </View>
      ) : trials.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Karşılaştırmak için veri gerekli"
          message="Deneme girdikçe dönemsel gelişimin ve kişisel rekorların burada görünecek."
          actionLabel="Deneme Gir"
          onAction={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
          color="accent"
        />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <SegmentTabs
            options={PERIOD_OPTIONS}
            value={periodDays}
            onChange={handlePeriod}
            style={{ marginBottom: STEP.s3 }}
          />

          {period && (
            <PeriodSummary
              current={period.current}
              previous={period.previous}
              diff={period.diff}
              improvementRate={period.improvementRate}
              consistency={consistency}
            />
          )}

          {subjects.length > 0 && <SubjectProgress subjects={subjects} />}
          <PersonalBests bests={bests} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function ComparativeScreen() {
  return (
    <ScreenErrorBoundary>
      <ComparativeContent />
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
  loadingWrap: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s4,
  },
  scroll: {
    paddingHorizontal: GUTTER,
    paddingBottom: 80,
  },
});
