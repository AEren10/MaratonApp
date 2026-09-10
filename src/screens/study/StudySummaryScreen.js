import { useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { useSelector } from "react-redux";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import * as H from "../../lib/haptics";
import { Button, StatBlock } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { XP_REWARDS } from "../../constants/gamification";
import { usePaywallTrigger } from "../../hooks/usePaywallTrigger";
import { useInAppReview } from "../../hooks/useInAppReview";
import { ROOT_STACK } from "../../navigation/routes";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useRoadmapNextAction } from "../roadmap/useRoadmapNextAction";
import RouteNextActionPanel from "../roadmap/components/RouteNextActionPanel";
import { StudySummaryStats } from "./components/StudySummaryStats";

export default function StudySummaryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    subjectLabel = "Çalışma",
    subjectColor = C.accent,
    topic = "",
    duration = 0,
    questions = 0,
    correctCount = 0,
  } = route.params ?? {};
  const wrongCount = Math.max(0, questions - correctCount);

  const streak = useSelector((state) => state.studyLog.streak);
  const todayLogs = useSelector((state) => state.studyLog.todayLogs);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const todaySolved = useMemo(
    () => todayLogs.reduce((sum, l) => sum + (l.questionCount || 0), 0),
    [todayLogs],
  );
  const todayMinutes = useMemo(
    () => todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0),
    [todayLogs],
  );

  const xpEarned = useMemo(() => {
    let xp = Math.floor(duration / 15) * XP_REWARDS.study_15min;
    xp += questions * XP_REWARDS.question_solved;
    return xp;
  }, [duration, questions]);

  const { incrementAndCheck, showDelayedPaywall, cleanup } = usePaywallTrigger();
  const { maybeRequestReview } = useInAppReview();
  const { routeCreated, weeks } = useStudyRoute();
  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({ navigation, routeCreated, weeks });

  useEffect(() => {
    H.success();
    incrementAndCheck().then((shouldShowPaywall) => {
      if (shouldShowPaywall) {
        showDelayedPaywall(2000);
      } else {
        setTimeout(() => maybeRequestReview(), 2500);
      }
    });
    return cleanup;
  }, []);

  const safeGoal = dailyGoal > 0 ? dailyGoal : 100;
  const goalReached = todaySolved >= safeGoal;

  const dismiss = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_STACK.MAIN_TABS, state: { routes: [{ name: SCREENS.HOME }] } }],
      }),
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s5, paddingBottom: STEP.s3 }}>
        <Animated.Text entering={FadeInUp.duration(500)} style={[TYPOGRAPHY.label, { color: C.accentBright ?? C.accent }]}>
          DURAK TAMAMLANDI
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(80).duration(500)}>
          <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s2 }]}>Rota ilerledi</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={{ marginTop: STEP.s2 }}>
          <StatBlock value={String(duration)} unit="dakikalık çalışma tamamlandı" size="large" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(180).duration(500)}
          style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s2 }}
        >
          <View style={{ width: 7, height: 7, borderRadius: 1, backgroundColor: subjectColor }} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]} numberOfLines={1}>
            {subjectLabel}{topic ? ` · ${topic}` : ""}{questions > 0 ? ` · ${questions} soru · ${wrongCount} yanlış` : ""}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: STEP.s4 }}>
          <StudySummaryStats
            C={C}
            todaySolved={todaySolved}
            safeGoal={safeGoal}
            goalReached={goalReached}
            todayMinutes={todayMinutes}
          />
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={{ gap: STEP.s1 }}>
          {nextRouteAction ? (
            <RouteNextActionPanel
              C={C}
              action={nextRouteAction}
              disabled={false}
              onStart={startNextRouteAction}
            />
          ) : null}
          <Button onPress={dismiss} variant={nextRouteAction ? "outline" : "primary"} fullWidth>
            {nextRouteAction ? "Ana sayfaya dön" : "Devam Et"}
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
