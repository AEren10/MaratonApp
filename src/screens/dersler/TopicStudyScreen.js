import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Button, ErrorState } from "../../components/design";
import { STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { SCREENS } from "../../constants/screens";
import { getSubjectByKey } from "../../themes/subjects";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useTopicStudyDetail } from "../../hooks/useTopicStudyDetail";
import { flattenRouteStops, routeDateTag } from "../../domain/route/routeOverview";
import { ROUTE_STOP_STATUS } from "../../domain/route/stopStatus";
import { TopicHeroHeader } from "./components/TopicHeroHeader";
import { TopicStatsRow } from "./components/TopicStatsRow";
import { TopicAccuracyBar } from "./components/TopicAccuracyBar";
import { TopicAccumulationChart } from "./components/TopicAccumulationChart";
import { TopicRecentStudies } from "./components/TopicRecentStudies";
import { TopicInfoList } from "./components/TopicInfoList";
import { TopicWrongNotesList } from "./components/TopicWrongNotesList";
import { TopicStudySkeleton } from "./components/TopicStudySkeleton";
import { Press } from "../../components/design/Press";

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const route = useRoute();
  const params = route.params ?? {};

  const subject = useMemo(() => {
    if (params.subject) return params.subject;
    const key = params.subjectKey;
    if (!key) return null;
    const found = getSubjectByKey(key);
    return found ? { key, name: found.label, icon: found.icon } : { key, name: key, icon: "bookOpen" };
  }, [params.subject, params.subjectKey]);

  const topic = useMemo(() => {
    if (params.topic) return params.topic;
    const name = params.topicName;
    return name ? { name } : null;
  }, [params.topic, params.topicName]);

  const color = subjectColorOf(C, subject?.key);
  const { user } = useAuth();
  const detail = useTopicStudyDetail({ userId: user?.id, subjectKey: subject?.key, topicName: topic?.name });
  const { loading, error, refetch } = detail;
  const notebookCount = detail.wrongList.length;

  const { weeks, isPaused } = useStudyRoute({ persist: false });
  const routePlace = useMemo(() => {
    if (!topic?.name) return "Rotada planlı değil";
    const flat = flattenRouteStops(weeks, { routeFrozen: isPaused });
    const match = flat.find(
      (it) => it.stop?.topic === topic.name && [ROUTE_STOP_STATUS.ACTIVE, ROUTE_STOP_STATUS.UPCOMING].includes(it.status)
    );
    if (!match) return "Rotada planlı değil";
    return match.weekStart ? routeDateTag(match.weekStart) : "Bu hafta";
  }, [weeks, isPaused, topic?.name]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.headerBar}>
        <Press haptic="none" hitSlop={10} onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Icon name="chevL" size={16} color={C.text} />
        </Press>
        <Text style={[TYPOGRAPHY.metaSemiBold, s.headerMeta, { color: C.text3 }]}>KONU DETAYI</Text>
        <View style={s.iconBtn} />
      </View>

      {loading ? (
        <TopicStudySkeleton C={C} />
      ) : error ? (
        <ErrorState preset="server" onPrimary={refetch} style={{ marginTop: STEP.s5 }} />
      ) : (
        <>
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <TopicHeroHeader C={C} subjectName={subject?.name} topicName={topic?.name} color={color} />
            <TopicStatsRow C={C} solved={detail.totalQuestions} durationLabel={detail.totalDurationLabel} notebookCount={notebookCount} />
            <TopicAccuracyBar C={C} accuracy={detail.accuracy} correctCount={detail.correctCount} totalQuestions={detail.totalQuestions} />
            <TopicAccumulationChart color={color} chart={detail.chart} />
            <TopicRecentStudies C={C} items={detail.recentLogs} />
            <TopicInfoList C={C} durationLabel={detail.totalDurationLabel} notebookCount={notebookCount} lastStudyText={detail.lastStudyText} routePlace={routePlace} />
            <TopicWrongNotesList
              C={C}
              items={detail.wrongList}
              onAllPress={() => navigation.navigate(SCREENS.WRONG_NOTEBOOK, { subjectKey: subject?.key })}
            />
          </ScrollView>

          <View style={[s.bottom, { backgroundColor: C.bg }]}>
            <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK, { subjectKey: subject?.key, topicName: topic?.name })}>
              Bu konuya durak koy
            </Button>
            {notebookCount > 0 && (
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>
                {`Defterdeki ${notebookCount} soruyu tekrar et`}
              </Text>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER - STEP.s1, paddingTop: STEP.s1, paddingBottom: STEP.s2 },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerMeta: { flex: 1, textAlign: "center", letterSpacing: 1.5, opacity: 0.5 },
  content: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 * 2 + STEP.s4 },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
