import React, { useCallback, useMemo, useState } from "react";
import { View, SectionList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { EmptyState, ErrorState, Skeleton, Button } from "../../components/design";
import { GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { subjectColorOf } from "../../themes/subjectPalette";
import { getSubjectByKey } from "../../themes/subjects";
import { useSubjectTopics } from "../../hooks/useSubjectTopics";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openHere } from "../../navigation/tabJump";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SubjectDetailHeader } from "./components/SubjectDetailHeader";
import { SubjectProgressHeader } from "./components/SubjectProgressHeader";
import { SubjectTopicSegment } from "./components/SubjectTopicSegment";
import { SubjectTopicRow } from "./components/SubjectTopicRow";
import { filterTopics, groupTopics } from "./subjectDetailUtils";

export default function SubjectDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const [segment, setSegment] = useState("all");

  const subjectKey = route.params?.subjectKey || route.params?.subject?.key || "matematik";
  const subjectMeta = useMemo(() => getSubjectByKey(subjectKey), [subjectKey]);
  const subjectName = route.params?.subjectName || route.params?.subject?.name || subjectMeta?.name || subjectMeta?.label || "Ders";

  const { topics, doneCount, totalCount, totalQuestionsSum, progressPct, loading, error, refresh, toggleTopic } =
    useSubjectTopics(subjectKey);
  const subjectColor = useMemo(() => subjectColorOf(C, subjectKey), [C, subjectKey]);
  const visibleTopics = useMemo(() => filterTopics(topics, segment), [topics, segment]);
  const groupedTopics = useMemo(() => groupTopics(visibleTopics), [visibleTopics]);

  const handleTopicPress = useCallback(
    (topic) => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey, topicName: topic.name }),
    [navigation, subjectKey],
  );

  const handleTopicToggle = useCallback((topic) => toggleTopic(topic.name), [toggleTopic]);

  const renderItem = useCallback(
    ({ item }) => (
      <SubjectTopicRow
        topic={item}
        C={C}
        subjectColor={subjectColor}
        onPress={handleTopicPress}
        onToggle={handleTopicToggle}
      />
    ),
    [C, subjectColor, handleTopicPress, handleTopicToggle],
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
          onSearch={() => openHere(navigation, TAB_KEYS.ANALIZ, SCREENS.SEARCH)}
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
              ListFooterComponent={
                <View style={styles.footerAction}>
                  <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK, { subjectKey })}>
                    Seçili 3 konuya durak koy
                  </Button>
                  <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>Tamamlananları gizle</Text>
                </View>
              }
            />
          </>
        )}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingTop: STEP.s1, paddingBottom: STEP.s5 },
  skeletonWrap: { paddingHorizontal: GUTTER, gap: STEP.s1 },
  state: { paddingHorizontal: GUTTER, marginTop: STEP.s3 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: STEP.s4, paddingBottom: STEP.s2, borderBottomWidth: 1, marginBottom: STEP.s2 },
  footerAction: { marginTop: STEP.s4, paddingBottom: STEP.s4 }
});
