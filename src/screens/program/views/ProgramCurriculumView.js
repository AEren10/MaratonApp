import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { ErrorState, Skeleton } from "../../../components/design";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useCurriculumMap } from "../../../hooks/useCurriculumMap";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { CurriculumProgressCard } from "../../roadmap/components/CurriculumProgressCard";
import CurriculumSubjectRow from "../../roadmap/components/CurriculumSubjectRow";
import { useTabScrollTop } from "../../../hooks/useTabScrollTop";

// Mufredat: dersler ve konu ilerlemesi (eski "Yol haritasi"). Tasarimi
// korundu; kalkan tek sey ust segment ve altta tekrar eden aksiyon kartlari.
export function ProgramCurriculumView() {
  const scrollRef = useTabScrollTop();
  const C = useC();
  const navigation = useNavigation();
  const map = useCurriculumMap();

  useFocusEffect(useCallback(() => { map.refresh?.(); }, [map.refresh]));

  const openSubject = useCallback((subject) => {
    navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: subject.key, subjectName: subject.name });
  }, [navigation]);

  if (map.loading) {
    return (
      <View style={s.pad}>
        <Skeleton height={220} radius={SHAPE.sheet} />
        <Skeleton height={320} radius={SHAPE.panel} style={{ marginTop: STEP.s3 }} />
      </View>
    );
  }
  if (map.total === 0) return <ErrorState preset="server" onPrimary={map.refresh} style={s.pad} />;

  return (
    <ScrollView
      ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.pad}>
        <CurriculumProgressCard done={map.done} total={map.total} left={map.left} pct={map.pct} />
      </View>
      <View style={[s.pad, s.groups]}>
        {map.groups.map((g) => (
          <View key={g.key}>
            <View style={s.groupHead}>
              <View style={s.groupTitleRow}>
                <Text style={[TYPOGRAPHY.bodySemiBold, s.groupTitle, { color: C.text }]}>{g.label}</Text>
                {g.countLabel ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{g.countLabel}</Text> : null}
              </View>
              <View style={[s.rule, { backgroundColor: C.line }]} />
              <Text style={[TYPOGRAPHY.tableValue, s.num, { color: C.text3 }]}>{`${g.done}/${g.total}`}</Text>
            </View>
            {g.items.map((subject) => (
              <CurriculumSubjectRow key={subject.key} subject={subject} onPress={openSubject} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  scroll: { paddingBottom: 120 },
  groups: { gap: STEP.s4, paddingTop: STEP.s4 },
  groupHead: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s1 + 2 },
  groupTitleRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  groupTitle: { letterSpacing: 0.5 },
  rule: { flex: 1, height: 1 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
});
