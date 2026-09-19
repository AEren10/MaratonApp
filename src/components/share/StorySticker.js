import { forwardRef } from "react";
import { View, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { STORY_KIND } from "../../domain/share/storySticker";
import { BrandBackground, PhotoBackground } from "./StoryBackground";
import { StoryFoot } from "./StoryFoot";
import { storyPalette } from "./storyPalette";
import {
  StorySimpleBody,
  StoryStatsBody,
  StoryStreakBody,
} from "./bodies/StoryNumberBodies";
import { StoryRouteBody } from "./bodies/StoryRouteBody";
import { StoryCardBody } from "./bodies/StoryCardBody";
import {
  StoryCountdownBody,
  StoryHonestBody,
  StoryNetBody,
} from "./bodies/StoryMomentBodies";

// Tasarimin tuvali: 9:16, sabit olcu. Kucuk gosterilecekse SARAN view
// olceklenir, tuval degil — yakalama tam cozunurlukte olsun diye.
export const STORY_WIDTH = 405;
export const STORY_HEIGHT = 720;

const BODIES = {
  [STORY_KIND.ISTATISTIK]: StoryStatsBody,
  [STORY_KIND.SADE]: StorySimpleBody,
  [STORY_KIND.SERI]: StoryStreakBody,
  [STORY_KIND.ROTA]: StoryRouteBody,
  [STORY_KIND.KART]: StoryCardBody,
  [STORY_KIND.GERISAYIM]: StoryCountdownBody,
  [STORY_KIND.NET]: StoryNetBody,
  [STORY_KIND.DURUST]: StoryHonestBody,
};

export function isStoryKindReady(kind) {
  return Boolean(BODIES[kind]);
}

/**
 * Tek bir story etiketi. `ref` view-shot'in yakaladigi dugumdur.
 */
export const StorySticker = forwardRef(function StorySticker({ variant, photoUri }, ref) {
  const C = useC();
  if (!variant) return null;
  const Body = BODIES[variant.kind];
  if (!Body) return null;

  const p = storyPalette(C, variant.background);
  return (
    <View ref={ref} collapsable={false} style={[s.canvas, { backgroundColor: C.bg }]}>
      {p.photo ? (
        <PhotoBackground uri={photoUri} label="SENİN FOTOĞRAFIN" />
      ) : (
        <BrandBackground C={C} width={STORY_WIDTH} height={STORY_HEIGHT} />
      )}

      <Body data={variant.data} p={p} C={C} />

      {variant.kind !== STORY_KIND.KART ? (
        <StoryFoot p={p} daysToExam={variant.data.daysToExam} />
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  canvas: { width: STORY_WIDTH, height: STORY_HEIGHT, overflow: "hidden" },
});
