import { useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { useSelector } from "react-redux";
import Animated, { FadeInUp } from "react-native-reanimated";

import * as H from "../../lib/haptics";
import { Icon } from "../../components/design";
import { Press } from "../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
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

export default function StudySummaryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    subjectLabel = "Çalışma", subjectColor = C.accent, topic = "",
    duration = 0, questions = 0, correctCount = 0,
  } = route.params ?? {};
  const wrongCount = Math.max(0, questions - correctCount);

  const todayLogs = useSelector((state) => state.studyLog.todayLogs);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const todaySolved = useMemo(() => todayLogs.reduce((sum, l) => sum + (l.questionCount || 0), 0), [todayLogs]);
  const todayMinutes = useMemo(() => todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0), [todayLogs]);

  const { incrementAndCheck, showDelayedPaywall, cleanup } = usePaywallTrigger();
  const { maybeRequestReview } = useInAppReview();
  const { routeCreated, weeks } = useStudyRoute();
  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({ navigation, routeCreated, weeks });

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

  const dismiss = () => {
    openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.headerRow}>
        <Animated.Text entering={FadeInUp.duration(500)} style={[TYPOGRAPHY.label, { color: C.accentBright ?? C.accent }]}>
          DURAK TAMAMLANDI
        </Animated.Text>
        <Press
          haptic="tap"
          onPress={dismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.closeBtn}
        >
          <Icon name="x" size={18} color={C.text2} />
        </Press>
      </View>

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

        <Animated.View style={{ marginTop: STEP.s4 }}>
          <StudySummaryStats
            C={C}
            todaySolved={todaySolved}
            safeGoal={safeGoal}
            goalReached={goalReached}
            todayMinutes={todayMinutes}
          />
        </Animated.View>

        <View style={{ marginTop: STEP.s4 }}>
          <StoryShareBlock moment={STORY_MOMENT.SESSION} emphasis="quiet" />
        </View>

        <StudySummaryActions
          C={C}
          wrongCount={wrongCount}
          onAddWrong={() => navigation.navigate(SCREENS.ADD_WRONG, { subjectKey: route.params?.subjectKey })}
          nextRouteAction={nextRouteAction}
          startNextRouteAction={startNextRouteAction}
          onDismiss={dismiss}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    paddingBottom: STEP.s1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    paddingBottom: STEP.s5,
  },
});
