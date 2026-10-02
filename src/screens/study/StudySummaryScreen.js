import { useEffect, useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { useSelector } from "react-redux";

import * as H from "../../lib/haptics";
import { STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { selectStreak, selectLongestStreak } from "../../store/slices/studyLogSlice";
import { shareReady } from "../../domain/home/discoverTiming";
import { usePaywallTrigger } from "../../hooks/usePaywallTrigger";
import { useInAppReview } from "../../hooks/useInAppReview";
import { openInTab } from "../../navigation/tabJump";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useRoadmapNextAction } from "../roadmap/useRoadmapNextAction";
import { StudySummaryStats } from "./components/StudySummaryStats";
import { StudySummaryHero } from "./components/StudySummaryHero";
import { StudySummaryActions } from "./components/StudySummaryActions";
import { StoryShareBlock } from "../../components/share/StoryShareBlock";
import { STORY_MOMENT } from "../../domain/share/storySticker";
import { studyOutcomeLine } from "../../domain/study/studyOutcome";
import { StudySummaryOutcome } from "./components/StudySummaryOutcome";
import { StudySummaryHeader } from "./components/StudySummaryHeader";

export default function StudySummaryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    subjectLabel = "Çalışma", subjectColor = C.accent, topic = "",
    duration = 0, questions = 0, correctCount = 0, routeStopId = null, routeOutcome = null,
  } = route.params ?? {};
  const wrongCount = Math.max(0, questions - correctCount);

  const todayLogs = useSelector((state) => state.studyLog.todayLogs);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);
  // Hikaye karti gosterecek ilerleme (3 gun) olusmadan sunulmaz.
  const canShare = shareReady({ streak: useSelector(selectStreak), longestStreak: useSelector(selectLongestStreak) });

  const todaySolved = useMemo(() => todayLogs.reduce((sum, l) => sum + (l.questionCount || 0), 0), [todayLogs]);
  const todayMinutes = useMemo(() => todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0), [todayLogs]);

  const { incrementAndCheck, showDelayedPaywall, cleanup } = usePaywallTrigger();
  const { maybeRequestReview } = useInAppReview();
  const { routeCreated, weeks } = useStudyRoute();
  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({ navigation, routeCreated, weeks });
  const outcome = useMemo(
    () => studyOutcomeLine({ outcome: routeOutcome, week: weeks?.[0], stopId: routeStopId, subjectLabel }),
    [routeOutcome, weeks, routeStopId, subjectLabel],
  );

  useEffect(() => {
    H.success();
    incrementAndCheck().then((shouldShowPaywall) => {
      if (shouldShowPaywall) showDelayedPaywall(2000);
      else setTimeout(() => maybeRequestReview(), 2500);
    });
    return cleanup;
  }, []);

  const safeGoal = dailyGoal > 0 ? dailyGoal : 100;
  const goalReached = todaySolved >= safeGoal;

  const dismiss = () => openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <StudySummaryHeader stopDone={Boolean(routeOutcome?.routeCompleted)} onClose={dismiss} C={C} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StudySummaryHero
          C={C}
          duration={duration}
          subjectColor={subjectColor}
          subjectLabel={subjectLabel}
          topic={topic}
          questions={questions}
          wrongCount={wrongCount}
        />

        <StudySummaryOutcome line={outcome} C={C} />

        {/* Sira: ne oldu -> siradaki durak -> bugun -> paylasim (en altta). */}
        <StudySummaryActions
          C={C}
          wrongCount={wrongCount}
          onAddWrong={() => navigation.navigate(SCREENS.ADD_WRONG, { subjectKey: route.params?.subjectKey })}
          nextRouteAction={nextRouteAction}
          startNextRouteAction={startNextRouteAction}
          onDismiss={dismiss}
        />

        <StudySummaryStats
          C={C}
          todaySolved={todaySolved}
          safeGoal={safeGoal}
          goalReached={goalReached}
          todayMinutes={todayMinutes}
        />

        {canShare ? (
          <View style={{ marginTop: STEP.s4, paddingBottom: STEP.s4 }}>
            <StoryShareBlock moment={STORY_MOMENT.SESSION} emphasis="quiet" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    paddingBottom: STEP.s5,
  },
});
