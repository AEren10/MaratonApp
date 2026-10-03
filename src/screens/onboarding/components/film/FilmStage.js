import { useEffect, useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import * as H from "../../../../lib/haptics";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { STEP } from "../../../../themes/tokens";
import { REVEAL_MS } from "./filmMotion";

// Durak tiklendigi an (SceneStop: tik 900ms gecikme + cizimin ortasi).
const TICK_HAPTIC_MS = 1200;
const SWIPE_PX = 40;
import { SceneRoute } from "./SceneRoute";
import { SceneStop } from "./SceneStop";
import { SceneWeek } from "./SceneWeek";

const SCENES = { route: SceneRoute, stop: SceneStop, week: SceneWeek };

// Filmin perdesi: kartsiz, dogrudan zemin uzerinde (kullanici: arkadaki kart
// kalksin). Yalniz aktif sahne
// bagli; anahtar (tur + sahne) degisince sahne bastan oynar. Sol yarisina
// dokunmak geri, sag yarisi ileri -- hikaye kalibi; kaydirmak da olur.
export function FilmStage({ sceneKey, cycle, height, compact, onPrev, onNext, C }) {
  const Scene = SCENES[sceneKey];

  // Tek titresim: durak tiklendiginde, yalniz ilk izleyiste (film doner;
  // her turda titreseydi telefon cebinde vizildardi).
  useEffect(() => {
    if (sceneKey !== "stop" || cycle !== 0) return undefined;
    const t = setTimeout(() => H.tap(), TICK_HAPTIC_MS);
    return () => clearTimeout(t);
  }, [sceneKey, cycle]);

  // Kaydirarak gecis: sola ileri, saga geri. Dokunma (yarilar) de calisir.
  const swipe = useMemo(() => Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_PX || e.velocityX < -600) scheduleOnRN(onNext);
      else if (e.translationX > SWIPE_PX || e.velocityX > 600) scheduleOnRN(onPrev);
    }), [onNext, onPrev]);

  return (
    <GestureDetector gesture={swipe}>
    <View
      style={[s.card, { height }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Maraton uygulamasından canlı önizleme"
    >
      <Animated.View
        key={`${cycle}-${sceneKey}`}
        entering={FadeIn.duration(REVEAL_MS)}
        exiting={FadeOut.duration(REVEAL_MS / 2)}
        style={[s.scene, compact && s.sceneCompact]}
      >
        <Scene C={C} compact={compact} />
      </Animated.View>
      <View style={s.taps} pointerEvents="box-none">
        <Pressable style={s.half} onPress={onPrev} accessibilityLabel="Önceki sahne" />
        <Pressable style={s.half} onPress={onNext} accessibilityLabel="Sonraki sahne" />
      </View>
    </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
  },
  scene: {
    ...StyleSheet.absoluteFillObject,
    paddingVertical: STEP.s3,
    justifyContent: "center",
  },
  sceneCompact: { paddingVertical: STEP.s2 + 4 },
  taps: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  half: { flex: 1 },
});
