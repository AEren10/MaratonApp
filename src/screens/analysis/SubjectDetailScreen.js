import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState, ErrorState, Skeleton } from "../../components/design";
import { GUTTER, STEP } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useSubjectTopics } from "../../hooks/useSubjectTopics";
import { useSubjectTrialStats } from "../../hooks/useSubjectTrialStats";
import { SCREENS } from "../../constants/screens";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SubjectDetailHeader } from "./components/SubjectDetailHeader";
import { SubjectProgressHeader } from "./components/SubjectProgressHeader";
import { SubjectTrialStats } from "./components/SubjectTrialStats";
import { SubjectTopicSegment } from "./components/SubjectTopicSegment";
import { SubjectTopicRow } from "./components/SubjectTopicRow";

function filterTopics(topics, segment) {
  if (segment === "done") return topics.filter((t) => t.done);
  if (segment === "remaining") return topics.filter((t) => !t.done);
  return topics;
}

export default function SubjectDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const [segment, setSegment] = useState("all");

  const subjectKey = route.params?.subjectKey || route.params?.subject?.key || null;
  const subjectName = route.params?.subjectName || route.params?.subject?.name;

  useEffect(() => {
    if (!subjectKey) navigation.goBack();
  }, [subjectKey, navigation]);

  const { topics, doneCount, totalCount, totalQuestionsSum, progressPct, loading, error, refresh } =
    useSubjectTopics(subjectKey);
  const trialStats = useSubjectTrialStats(subjectKey);
  const subjectColor = useMemo(() => subjectColorOf(C, subjectKey), [C, subjectKey]);
  const visibleTopics = useMemo(() => filterTopics(topics, segment), [topics, segment]);

  const handleTopicPress = useCallback(
    (topic) => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey, topicName: topic.name }),
    [navigation, subjectKey],
  );
  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30)} style={styles.rowWrap}>
        <SubjectTopicRow topic={item} C={C} onPress={handleTopicPress} />
      </Animated.View>
    ),
    [C, handleTopicPress],
  );
  const keyExtractor = useCallback((item) => item.name, []);

  if (!subjectKey) return null;

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <SubjectDetailHeader
          C={C}
          onBack={() => navigation.goBack()}
          onSearch={() => navigation.navigate(SCREENS.SEARCH)}
        />

        <SubjectProgressHeader
          C={C}
          subjectName={subjectName}
          subjectColor={subjectColor}
          doneCount={doneCount}
          totalCount={totalCount}
          totalQuestionsSum={totalQuestionsSum}
          progressPct={progressPct}
        />

        <SubjectTrialStats C={C} stats={trialStats} />

        <SubjectTopicSegment C={C} active={segment} onChange={setSegment} />

        {loading ? (
          <View style={styles.skeletonWrap}>
            <Skeleton height={52} radius={8} />
            <Skeleton height={52} radius={8} />
            <Skeleton height={52} radius={8} />
          </View>
        ) : error ? (
          <ErrorState preset="server" style={styles.state} onPrimary={refresh} />
        ) : visibleTopics.length === 0 ? (
          <EmptyState title="Bu filtrede konu yok." style={styles.state} />
        ) : (
          <FlatList
            data={visibleTopics}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            windowSize={5}
            maxToRenderPerBatch={12}
          />
        )}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  rowWrap: {},
  skeletonWrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, gap: STEP.s1 },
  state: { paddingHorizontal: GUTTER, marginTop: STEP.s3 },
});
