import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ErrorState, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useCurriculumMap } from "../../hooks/useCurriculumMap";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { CurriculumProgressCard } from "./components/CurriculumProgressCard";
import CurriculumSubjectRow from "./components/CurriculumSubjectRow";
import { CurriculumBottomActions } from "./components/CurriculumBottomActions";
import { RouteHeader } from "./components/RouteHeader";

const enter = (i) => FadeInDown.delay(i * 80).duration(600);

// Tasarim AKIS 7 · "Yol Haritası" — mufredat ilerlemesi (rota haftalari DEGIL).
function CurriculumMapInner() {
  const C = useC();
  const navigation = useNavigation();
  const map = useCurriculumMap();

  const openSubject = useCallback((subject) => {
    navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: subject.key, subjectName: subject.name });
  }, [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader
        title="Yol haritası"
        onBack={() => { if (navigation.canGoBack()) navigation.goBack(); }}
        onMore={() => navigation.navigate(SCREENS.SEARCH)}
        moreIcon="search"
        moreLabel="Konu ara"
      />
      {map.loading ? (
        <View style={s.pad}>
          <Skeleton height={220} radius={SHAPE.sheet} />
          <Skeleton height={320} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
        </View>
      ) : map.total === 0 ? (
        <ErrorState preset="server" onPrimary={map.refresh} style={s.pad} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)} style={s.pad}>
            <CurriculumProgressCard done={map.done} total={map.total} left={map.left} pct={map.pct} />
          </Animated.View>
          <Animated.View entering={enter(1)} style={[s.pad, s.groups]}>
            {map.groups.map((g) => (
              <View key={g.key}>
                <View style={s.groupHead}>
                  <View style={s.groupTitleRow}>
                    <Text style={[TYPOGRAPHY.bodySemiBold, s.groupTitle, { color: C.text }]}>{g.label}</Text>
                    {g.countLabel ? (
                      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{g.countLabel}</Text>
                    ) : null}
                  </View>
                  <View style={[s.rule, { backgroundColor: C.line }]} />
                  <Text style={[TYPOGRAPHY.tableValue, s.num, { color: C.text3 }]}>{`${g.done}/${g.total}`}</Text>
                </View>
                {g.items.map((subject) => (
                  <CurriculumSubjectRow key={subject.key} subject={subject} onPress={openSubject} />
                ))}
              </View>
            ))}
          </Animated.View>
          <View style={s.pad}>
            <CurriculumBottomActions
              C={C}
              onOpenProgram={() => navigation.navigate(SCREENS.DAILY_PLAN)}
              onAddTask={() => navigation.navigate(SCREENS.ADD_TASK)}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function CurriculumMapScreen() {
  return (
    <ScreenErrorBoundary>
      <CurriculumMapInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  pad: { paddingHorizontal: GUTTER },
  scroll: { paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  groups: { gap: STEP.s4, paddingTop: STEP.s4 },
  groupHead: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s1 + 2 },
  groupTitleRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  groupTitle: { letterSpacing: 0.5 },
  rule: { flex: 1, height: 1 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
});
