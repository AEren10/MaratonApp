import { useMemo } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, ErrorState } from "../../components/design";
import { Press } from "../../components/design/Press";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY, NAV_ICON } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { SCREENS } from "../../constants/screens";
import { getSubjectByKey } from "../../themes/subjects";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useTopicStudyDetail } from "../../hooks/useTopicStudyDetail";
import { topicStory } from "../../domain/insight/storyLines";
import { flattenRouteStops, routeDateTag } from "../../domain/route/routeOverview";
import { ROUTE_STOP_STATUS } from "../../domain/route/stopStatus";
import { TopicAccumulationChart } from "./components/TopicAccumulationChart";
import { StatsStrip } from "../../components/design/StatsStrip";
import { TopicStudySkeleton } from "./components/TopicStudySkeleton";

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const route = useRoute();
  const params = route.params ?? {};
  const subject = useMemo(() => {
    if (params.subject) return params.subject;
    const key = params.subjectKey;
    const found = key ? getSubjectByKey(key) : null;
    return found ? { key, name: found.label } : { key: key || "", name: key || "" };
  }, [params.subject, params.subjectKey]);

  const topicName = params.topic?.name || params.topicName || "Konu Detayı";
  const color = subjectColorOf(C, subject?.key);
  const { user } = useAuth();
  const detail = useTopicStudyDetail({ userId: user?.id, subjectKey: subject?.key, topicName });
  const { loading, error, refetch } = detail;
  const notebookCount = detail.wrongList?.length || 0;

  const { weeks, isPaused } = useStudyRoute({ persist: false });
  const routePlace = useMemo(() => {
    if (!topicName) return "Rotada planlı değil";
    const flat = flattenRouteStops(weeks, { routeFrozen: isPaused });
    const match = flat.find(
      (it) => it.stop?.topic === topicName && [ROUTE_STOP_STATUS.ACTIVE, ROUTE_STOP_STATUS.UPCOMING].includes(it.status)
    );
    if (!match) return "Rotada planlı değil";
    return match.weekStart ? routeDateTag(match.weekStart) : "Bu hafta";
  }, [weeks, isPaused, topicName]);

  const hasAccuracy = detail.correctCount > 0 && detail.accuracy != null;
  const heroLabel = hasAccuracy ? "DOĞRULUK ORANI" : "ÇÖZÜLEN SORU";
  const heroValue = hasAccuracy ? `%${detail.accuracy}` : `${detail.totalQuestions}`;
  const story = topicStory({
    q: detail.totalQuestions,
    accuracy: detail.correctCount > 0 ? detail.accuracy : null,
    wrongsOpen: notebookCount,
    daysSince: detail.daysSince,
    feel: detail.feel,
  });

  const links = [
    {
      label: "Bu konuya durak koy",
      note: "Günün veya haftanın planına çalışma durağı ekle",
      go: () => navigation.navigate(SCREENS.ADD_TASK, { subjectKey: subject?.key, topicName }),
    },
    {
      label: "Yanlışları",
      note: notebookCount > 0 ? `Defterde bekleyen ${notebookCount} yanlış soru` : "Defterde kayıtlı yanlış soru yok",
      go: () => navigation.navigate(SCREENS.WRONG_NOTEBOOK, { subjectKey: subject?.key, topicName }),
    },
    {
      label: "Rotadaki yeri",
      note: routePlace,
      go: () => navigation.navigate(SCREENS.ROADMAP),
    },
  ];

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={s.header}>
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
          <View style={[s.dot, { backgroundColor: color }]} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]} numberOfLines={1}>
            {topicName}
          </Text>
          {subject?.name ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{subject.name}</Text> : null}
        </View>

        {loading ? (
          <TopicStudySkeleton C={C} />
        ) : error ? (
          <ErrorState preset="server" onPrimary={refetch} style={{ marginTop: STEP.s5 }} />
        ) : (
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{heroLabel}</Text>
            <View style={s.hero}>
              <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{heroValue}</Text>
            </View>
            <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{story}</Text>

            {detail.chart ? <TopicAccumulationChart color={color} chart={detail.chart} /> : null}

            <StatsStrip C={C} cells={[
              { value: detail.totalQuestions > 0 ? String(detail.totalQuestions) : "—", label: "Çözülen" },
              { value: detail.totalDurationLabel || "—", label: "Süre" },
              { value: notebookCount > 0 ? String(notebookCount) : "—", label: "Defterde" },
              { value: detail.lastStudyText || "—", label: "Son çalışma" },
            ]} style={{ marginTop: STEP.s4 }} />

            <View style={s.links}>
              {links.map((l) => (
                <Press key={l.label} haptic="none" onPress={l.go} accessibilityRole="button" style={[s.link, { borderBottomColor: C.line }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{l.label}</Text>
                    <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{l.note}</Text>
                  </View>
                  <Icon name="chevR" size={14} color={C.text3} />
                </Press>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, height: CONTROL.tapMin },
  dot: { width: 10, height: 10, borderRadius: 3 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  hero: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s1 },
  links: { marginTop: STEP.s4 },
  link: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderBottomWidth: 1, minHeight: CONTROL.tapMin },
});
