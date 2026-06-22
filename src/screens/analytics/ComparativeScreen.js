import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { useC } from "../../contexts/ThemeContext";
import { Icon, GlassCard } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { comparePeriods, subjectComparison, personalBests, consistencyScore } from "../../lib/comparativeAnalytics";
import { PeriodSummary } from "./components/PeriodSummary";
import { SubjectProgress } from "./components/SubjectProgress";
import { PersonalBests } from "./components/PersonalBests";
import * as H from "../../lib/haptics";

const PERIODS = [
  { key: 7, label: "Hafta" },
  { key: 30, label: "Ay" },
  { key: 90, label: "3 Ay" },
];

export default function ComparativeScreen() {
  const navigation = useNavigation();
  const C = useC();
  const trials = useSelector(selectTrials);
  const [periodDays, setPeriodDays] = useState(30);

  const period = useMemo(() => comparePeriods(trials, periodDays), [trials, periodDays]);
  const subjects = useMemo(() => subjectComparison(trials, periodDays), [trials, periodDays]);
  const bests = useMemo(() => personalBests(trials), [trials]);
  const consistency = useMemo(() => consistencyScore(trials, periodDays), [trials, periodDays]);

  const handlePeriod = useCallback((days) => { H.select(); setPeriodDays(days); }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, marginLeft: SPACING.md, flex: 1 }}>
          Karşılaştırmalı Analiz
        </Text>
      </View>

      {trials.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Karşılaştırmak için veri gerekli"
          message="Deneme girdikçe dönemsel gelişimin ve kişisel rekorların burada görünecek."
          actionLabel="Deneme Gir"
          onAction={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
          color="accent"
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.xl }}>
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
                    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg,
                    borderWidth: 1.5, alignItems: "center",
                    backgroundColor: active ? C.accent + "20" : "transparent",
                    borderColor: active ? C.accent : C.border,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: active ? C.accent : C.sec }}>
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
            <GlassCard radius={RADIUS.xxl} style={{ marginTop: SPACING.lg, padding: SPACING.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ ...TYPOGRAPHY.label, color: C.muted, letterSpacing: 0.6 }}>TUTARLILIK</Text>
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: SPACING.xs }}>
                    {consistency.label}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: C.purple }}>
                    {Math.round(consistency.score)}
                  </Text>
                  <Text style={{ ...TYPOGRAPHY.micro, color: C.purple, opacity: 0.6 }}>/100</Text>
                </View>
              </View>
            </GlassCard>
          )}

          {subjects.length > 0 && (
            <View style={{ marginTop: SPACING.xl }}>
              <SubjectProgress subjects={subjects} />
            </View>
          )}

          <View style={{ marginTop: SPACING.xl }}>
            <PersonalBests bests={bests} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
