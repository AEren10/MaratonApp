import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ErrorState, Icon, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useCurriculumMap } from "../../hooks/useCurriculumMap";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { CurriculumProgressCard } from "./components/CurriculumProgressCard";
import CurriculumSubjectRow from "./components/CurriculumSubjectRow";
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
        onBack={() => navigation.goBack()}
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
                  <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{g.label}</Text>
                  <View style={[s.rule, { backgroundColor: C.line }]} />
                  <Text style={[TYPOGRAPHY.tableHead, s.num, { color: C.text3 }]}>{`${g.done}/${g.total}`}</Text>
                </View>
                {g.items.map((subject) => (
                  <CurriculumSubjectRow key={subject.key} subject={subject} onPress={openSubject} />
                ))}
              </View>
            ))}
          </Animated.View>
          <View style={s.pad}>
            <Pressable
              onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
              accessibilityRole="button"
              style={({ pressed }) => [s.link, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.elev }]}
            >
              <Text style={[TYPOGRAPHY.captionMedium, s.flex, { color: C.text2 }]}>Bu döneme durak ekle</Text>
              <Icon name="chevR" size={12} color={C.text5} />
            </Pressable>
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
  scroll: { paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  groups: { gap: STEP.s3 + 6, paddingTop: STEP.s3 + 6 },
  groupHead: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 3, paddingBottom: STEP.s1 + 2 },
  rule: { flex: 1, height: 1 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: CONTROL.buttonPrimary,
    paddingHorizontal: STEP.s2 + 4,
    marginTop: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  flex: { flex: 1 },
});
