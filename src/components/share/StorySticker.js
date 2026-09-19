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

// Tasarimin tuvali: 9:16, sabit olcu. Kucuk gosterilecekse SARAN view
// olceklenir, tuval degil — yakalama tam cozunurlukte olsun diye.
export const STORY_WIDTH = 405;
export const STORY_HEIGHT = 720;

const BODIES = {
  [STORY_KIND.ISTATISTIK]: StoryStatsBody,
  [STORY_KIND.SADE]: StorySimpleBody,
  [STORY_KIND.SERI]: StoryStreakBody,
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

      <Body data={variant.data} p={p} />

      {variant.kind !== STORY_KIND.KART ? (
        <StoryFoot p={p} daysToExam={variant.data.daysToExam} />
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  canvas: { width: STORY_WIDTH, height: STORY_HEIGHT, overflow: "hidden" },
});
