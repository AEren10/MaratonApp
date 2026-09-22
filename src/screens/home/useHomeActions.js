import { useCallback, useMemo } from "react";

import { SCREENS } from "../../constants/screens";
import { trackButtonTap } from "../../lib/analytics";
import { buildStudyTimerParams } from "../../domain/plan/studyTimerParams";

// Ana Sayfa'nin tum cikislari. Kaldirilan eski kartlarin hedefleri tasarimdaki
// karsiliklarina baglandi (bkz. HomeScreen basligi).
export function useHomeActions({ navigation, go }) {
  const startTask = useCallback((task) => {
    if (!task) { go(SCREENS.ADD_STUDY)(); return; }
    trackButtonTap("home_hero_cta_start", { subject: task.subject, targetScreen: SCREENS.STUDY_TIMER });
    navigation.navigate(SCREENS.STUDY_TIMER, buildStudyTimerParams(task));
  }, [go, navigation]);

  const subjectDetail = useCallback((subjectKey, subjectName) => {
    navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey, subjectName });
  }, [navigation]);

  return useMemo(() => ({
    startTask,
    subjectDetail,
    profile: go(SCREENS.PROFILE),
    calendar: go(SCREENS.CALENDAR),
    route: go(SCREENS.ROADMAP),
    fullRoute: go(SCREENS.ROUTE_FULL),
    redrawRoute: go(SCREENS.ROUTE_REDRAW),
    plan: go(SCREENS.PLAN_DETAIL),
    analysis: go(SCREENS.ANALYSIS),
    debt: go(SCREENS.TOPIC_DEBT),
    weekReport: go(SCREENS.SUMMARY, { period: "week" }),
    notebook: go(SCREENS.WRONG_NOTEBOOK),
    // Tekrar bekleyen varken listeye degil dogrudan oturuma gidilir.
    review: go(SCREENS.SWIPE_REVIEW),
    record: go(SCREENS.ADD_STUDY),
    proPreview: go(SCREENS.PRO_PREVIEW),
    firstWeek: go(SCREENS.FIRST_WEEK),
  }), [go, startTask, subjectDetail]);
}
