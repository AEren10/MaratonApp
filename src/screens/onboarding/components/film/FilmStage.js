import { View, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { STEP } from "../../../../themes/tokens";
import { REVEAL_MS } from "./filmMotion";
import { SceneRoute } from "./SceneRoute";
import { SceneStop } from "./SceneStop";
import { SceneWeek } from "./SceneWeek";

const SCENES = { route: SceneRoute, stop: SceneStop, week: SceneWeek };

// Filmin perdesi: kartsiz, dogrudan zemin uzerinde (kullanici: arkadaki kart
// kalksin). Yalniz aktif sahne
// bagli; anahtar (tur + sahne) degisince sahne bastan oynar. Sol yarisina
// dokunmak geri, sag yarisi ileri -- hikaye kalibi.
export function FilmStage({ sceneKey, cycle, height, compact, onPrev, onNext, C }) {
  const Scene = SCENES[sceneKey];
  return (
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
