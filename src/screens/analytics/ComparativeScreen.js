import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { useC } from "../../contexts/ThemeContext";
import { Icon, Skeleton } from "../../components/design";
import { ErrorState } from "../../components/design/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useSync } from "../../contexts/DataSyncContext";
import { comparePeriods, subjectComparison, personalBests, consistencyScore } from "../../lib/comparativeAnalytics";
import { PeriodSummary } from "./components/PeriodSummary";
import { SubjectProgress } from "./components/SubjectProgress";
import { PersonalBests } from "./components/PersonalBests";
import * as H from "../../lib/haptics";
import { Press } from "../../components/design/Press";

const PERIODS = [
  { key: 7, label: "Hafta" },
  { key: 30, label: "Ay" },
  { key: 90, label: "3 Ay" },
];

export default function ComparativeScreen() {
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

  const handlePeriod = useCallback((days) => { H.select(); setPeriodDays(days); }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s3 }}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner">
          <Icon name="arrowL" size={22} color={C.text} />
        </Press>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, marginLeft: STEP.s3, flex: 1 }}>
          Karşılaştırmalı Analiz
        </Text>
      </View>

      {trials.length === 0 && !syncedOnce && !readError ? (
        <View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <Skeleton width="100%" height={96} radius={SHAPE.card} />
          <Skeleton width="100%" height={146} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
          <Skeleton width="100%" height={146} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
        </View>
      ) : readError ? (
        <View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
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
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: STEP.s2, marginBottom: STEP.s5 }}>
            {PERIODS.map((p) => {
              const active = periodDays === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => handlePeriod(p.key)}
                  accessibilityRole="button"
                  accessibilityLabel={p.label}
                  accessibilityHint="Zaman aralığını değiştirir"
                  style={{
                    flex: 1, paddingVertical: STEP.s2, borderRadius: 12,
                    borderWidth: 1.5, alignItems: "center",
                    backgroundColor: active ? C.accent + "20" : "transparent",
                    borderColor: active ? C.accent : C.border,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: active ? C.accent : C.text2 }}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {period && (
            <PeriodSummary
              current={period.current}
              previous={period.previous}
              diff={period.diff}
              improvementRate={period.improvementRate}
            />
          )}

          {consistency.trialCount > 0 && (
            <View style={{ marginTop: STEP.s4, padding: STEP.s4, borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.elev }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ ...TYPOGRAPHY.label, color: C.text3, letterSpacing: 0.6 }}>TUTARLILIK</Text>
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: STEP.s1 }}>
                    {consistency.label}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: "Bricolage_400", fontSize: 28, color: C.text }}>
                    {Math.round(consistency.score)}
                  </Text>
                  <Text style={{ ...TYPOGRAPHY.micro, color: C.text2 }}>/100</Text>
                </View>
              </View>
            </View>
          )}

          {subjects.length > 0 && (
            <View style={{ marginTop: STEP.s5 }}>
              <SubjectProgress subjects={subjects} />
            </View>
          )}

          <View style={{ marginTop: STEP.s5 }}>
            <PersonalBests bests={bests} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
