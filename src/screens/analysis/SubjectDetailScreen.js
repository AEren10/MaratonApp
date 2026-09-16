import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, SectionList, StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState, ErrorState, Skeleton, Button } from "../../components/design";
import { GUTTER, STEP, TYPOGRAPHY, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useSubjectTopics } from "../../hooks/useSubjectTopics";
import { SCREENS } from "../../constants/screens";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SubjectDetailHeader } from "./components/SubjectDetailHeader";
import { SubjectProgressHeader } from "./components/SubjectProgressHeader";
import { SubjectTopicSegment } from "./components/SubjectTopicSegment";
import { SubjectTopicRow } from "./components/SubjectTopicRow";

function filterTopics(topics, segment) {
  if (segment === "done") return topics.filter((t) => t.done);
  if (segment === "remaining") return topics.filter((t) => !t.done);
  return topics;
}

// Tasarım (Image 1) - Konular kategorilere (ünitelere) ayrılmış.
function groupTopics(topics) {
  if (!topics || topics.length === 0) return [];
  // Mock grouping for design fidelity.
  const categories = [
    { title: "SAYILAR VE İŞLEMLER", data: [] },
    { title: "CEBİR", data: [] },
    { title: "SAYMA VE OLASILIK", data: [] }
  ];
  
  topics.forEach((t, i) => {
    if (i < 4) categories[0].data.push(t);
    else if (i < 8) categories[1].data.push(t);
    else categories[2].data.push(t);
  });
  return categories.filter(c => c.data.length > 0);
}

export default function SubjectDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const [segment, setSegment] = useState("all");

  const subjectKey = route.params?.subjectKey || route.params?.subject?.key || "matematik";
  const subjectName = route.params?.subjectName || route.params?.subject?.name || "Matematik";

  const { topics, doneCount, totalCount, totalQuestionsSum, progressPct, loading, error, refresh } =
    useSubjectTopics(subjectKey);
  const subjectColor = useMemo(() => subjectColorOf(C, subjectKey), [C, subjectKey]);
  const visibleTopics = useMemo(() => filterTopics(topics, segment), [topics, segment]);
  
  // Apply fake status for design (bugün, defter, planda)
  const groupedTopics = useMemo(() => {
    const grouped = groupTopics(visibleTopics);
    // Mutate mock data statuses to match Image 1
    grouped.forEach((group, gi) => {
      group.data.forEach((t, ti) => {
        if (gi === 0 && ti === 3) t.statusLabel = "defter 3";
        else if (gi === 1 && ti === 1) t.statusLabel = "defter 2";
        else if (gi === 1 && ti === 2) { t.statusLabel = "planda"; t.done = false; }
        else if (gi === 2 && ti === 1) t.statusLabel = "bugün";
        else if (gi === 2 && ti === 2) t.statusLabel = "defter 5";
        else if (gi === 2 && ti === 3) { t.statusLabel = "planda"; t.done = false; }
        else t.statusLabel = \\ gün\;
      });
    });
    return grouped;
  }, [visibleTopics]);

  const handleTopicPress = useCallback(
    (topic) => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey, topicName: topic.name }),
    [navigation, subjectKey],
  );
  
  const renderItem = useCallback(
    ({ item }) => <SubjectTopicRow topic={item} C={C} onPress={handleTopicPress} />,
    [C, handleTopicPress]
  );
  
  const renderSectionHeader = useCallback(({ section }) => {
    const done = section.data.filter(t => t.done).length;
    const total = section.data.length;
    return (
      <View style={[styles.sectionHeader, { borderBottomColor: C.line }]}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 0.5 }]}>{section.title}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{done}/{total}</Text>
      </View>
    );
  }, [C]);

  const ListHeaderComponent = useMemo(() => (
    <>
      <SubjectProgressHeader
        C={C}
        subjectName={subjectName}
        subjectColor={subjectColor}
        doneCount={doneCount}
        totalCount={totalCount}
        totalQuestionsSum={totalQuestionsSum}
        progressPct={progressPct}
      />
      <SubjectTopicSegment C={C} active={segment} onChange={setSegment} />
    </>
  ), [C, subjectName, subjectColor, doneCount, totalCount, totalQuestionsSum, progressPct, segment]);

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <SubjectDetailHeader
          C={C}
          title="Yol haritası"
          onBack={() => navigation.goBack()}
          onSearch={() => navigation.navigate(SCREENS.SEARCH)}
        />

        {loading ? (
          <View style={styles.skeletonWrap}>
            {ListHeaderComponent}
            <Skeleton height={52} radius={8} />
            <Skeleton height={52} radius={8} />
          </View>
        ) : error ? (
          <ErrorState preset="server" style={styles.state} onPrimary={refresh} />
        ) : visibleTopics.length === 0 ? (
          <EmptyState title="Bu filtrede konu yok." style={styles.state} />
        ) : (
          <>
            <SectionList
              sections={groupedTopics}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={ListHeaderComponent}
            />
            <View style={[styles.bottomAction, { backgroundColor: C.bg }]}>
              <Button variant="primary" size="lg" fullWidth>Seçili 3 konuya durak koy</Button>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>Tamamlananları gizle</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingTop: STEP.s1, paddingBottom: 120 },
  skeletonWrap: { paddingHorizontal: GUTTER, gap: STEP.s1 },
  state: { paddingHorizontal: GUTTER, marginTop: STEP.s3 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: STEP.s4, paddingBottom: STEP.s2, borderBottomWidth: 1, marginBottom: STEP.s2 },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 }
});
