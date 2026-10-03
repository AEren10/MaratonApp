import { useCallback } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { setAuthIntent } from "../../lib/authIntent";
import * as H from "../../lib/haptics";
import { GUTTER, STEP } from "../../themes/tokens";
import { MomentBackdrop } from "../../components/design/MomentBackdrop";
import { OnboardingPagination } from "./components/OnboardingPagination";
import { OnboardingCaption } from "./components/OnboardingCaption";
import { OnboardingFooter } from "./components/OnboardingFooter";
import { FilmStage } from "./components/film/FilmStage";
import { FILM_SCENES, FILM_SCENE_MS } from "./components/film/filmScenes";
import { useFilmClock } from "./components/film/useFilmClock";

// Acilis: uc slayt yerine tek bir film. Uygulamanin kendisi oynar (rota
// cizilir -> durak tiklenir -> hafta dolar), yazi sahneyle birlikte degisir,
// "Rotamı kur" her an elinin altinda -- izlemek zorunlu degil.
function OnboardingScreenInner() {
  const C = useC();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const { markSlidesAsSeen } = useExam();
  const film = useFilmClock({
    count: FILM_SCENES.length,
    duration: FILM_SCENE_MS,
    autoplay: !reduced,
  });
  const scene = FILM_SCENES[film.index];
  // Kucuk ekranda (SE) baslik ve sahne sikisir; kart butonun altina tasmaz.
  const compact = height < 740;
  const stageH = compact ? 226 : Math.round(Math.min(320, height * 0.36));

  const createRoute = useCallback(() => {
    H.success();
    setAuthIntent("register");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  const goToLogin = useCallback(() => {
    H.tap();
    setAuthIntent("login");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  const select = useCallback((i) => { H.select(); film.goTo(i); }, [film]);
  const next = useCallback(() => { H.select(); film.next(); }, [film]);
  const prev = useCallback(() => { H.select(); film.prev(); }, [film]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <MomentBackdrop />
      <OnboardingPagination
        total={FILM_SCENES.length}
        current={film.index}
        cycle={film.cycle}
        duration={FILM_SCENE_MS}
        onSelect={select}
        C={C}
      />
      <View style={s.body}>
        <OnboardingCaption scene={scene} compact={compact} C={C} />
        <View style={s.stageArea}>
          <FilmStage
            sceneKey={scene.key}
            cycle={film.cycle}
            height={stageH}
            compact={compact}
            onPrev={prev}
            onNext={next}
            C={C}
          />
        </View>
      </View>
      <OnboardingFooter onStart={createRoute} onLogin={goToLogin} C={C} />
    </SafeAreaView>
  );
}

export default function OnboardingScreen() {
  return (
    <ScreenErrorBoundary>
      <OnboardingScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  stageArea: { flex: 1, justifyContent: "center", paddingBottom: STEP.s2 },
});
