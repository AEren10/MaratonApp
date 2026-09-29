import { useCallback, useMemo } from "react";

import { SCREENS } from "../../constants/screens";
import { trackButtonTap } from "../../lib/analytics";
import { buildStudyTimerParams } from "../../domain/plan/studyTimerParams";
import { openProgram, PROGRAM_VIEWS } from "../../navigation/openProgram";

// Ana Sayfa'nin tum cikislari. Kaldirilan eski kartlarin hedefleri tasarimdaki
// karsiliklarina baglandi (bkz. HomeScreen basligi).
export function useHomeActions({ navigation, go }) {
  const startTask = useCallback((task) => {
    // Acik durak yoksa (gun bitti ya da bos) Durak ekle -- eskiden Calisma
    // kaydet aciliyordu, dugme 'Ilk duragini ekle' derken.
    if (!task) { navigation.navigate(SCREENS.ADD_TASK); return; }
    trackButtonTap("home_hero_cta_start", { subject: task.subject, targetScreen: SCREENS.STUDY_TIMER });
    navigation.navigate(SCREENS.STUDY_TIMER, buildStudyTimerParams(task));
  }, [go, navigation]);

  // Lig/Gruplar ve alt ekranlari ROTA yigininda da kayitli: dugme ekrani
  // bu sekmede acar, geri tusu Ana sayfaya doner. Eskiden Profil sekmesine
  // atlatiliyordu ve geri basinca kullanici Profil'de kaliyordu.
  const social = useCallback(() => {
    trackButtonTap("home_social_open", { targetScreen: SCREENS.LEAGUE });
    navigation.navigate(SCREENS.LEAGUE, { tab: "groups" });
  }, [navigation]);

  const subjectDetail = useCallback((subjectKey, subjectName) => {
    navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey, subjectName });
  }, [navigation]);

  return useMemo(() => ({
    startTask,
    subjectDetail,
    profile: go(SCREENS.PROFILE),
    calendar: () => openProgram(navigation, PROGRAM_VIEWS.MONTH),
    route: go(SCREENS.ROADMAP),
    fullRoute: go(SCREENS.ROUTE_FULL),
    redrawRoute: go(SCREENS.ROUTE_REDRAW),
    // "Programın tamamı" = bugunun plani (ayni duraklar, detayli). Haftanin
    // tamami Program sekmesinde.
    plan: go(SCREENS.PLAN_DETAIL),
    analysis: go(SCREENS.ANALYSIS),
    // Haftalik grafige dokununca: haftanin RAPORU degil, o gunlerin
    // KAYITLARI. Grafik zaten toplamlari gosteriyor; rapora gitmek yandan
    // yana gitmek olurdu. Bir cubuk yanlis gorunuyorsa duzeltilecek yer de
    // burasi — satir duzenlenip silinebiliyor.
    studyHistory: go(SCREENS.STUDY_HISTORY),
    notebook: go(SCREENS.WRONG_NOTEBOOK),
    // Tekrar bekleyen varken listeye degil dogrudan oturuma gidilir.
    review: go(SCREENS.SWIPE_REVIEW),
    record: go(SCREENS.ADD_STUDY),
    proPreview: go(SCREENS.PRO_PREVIEW),
    firstWeek: go(SCREENS.FIRST_WEEK),
    social,
    groups: social,
    league: social,
  }), [go, startTask, subjectDetail, social]);
}
