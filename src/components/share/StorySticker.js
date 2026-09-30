import { forwardRef } from "react";
import { View, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { STORY_BG, STORY_KIND } from "../../domain/share/storySticker";
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
import { StoryTrackBody } from "./bodies/StoryTrackBody";
import {
  StoryCountdownBody,
  StoryHonestBody,
  StoryNetBody,
} from "./bodies/StoryMomentBodies";

// Tasarimin tuvali: 9:16, sabit olcu. Kucuk gosterilecekse SARAN view
// olceklenir, tuval degil — yakalama tam cozunurlukte olsun diye.
// Olcu artik domain'de: yakalayan katman da ayni sayiyi okumali.
// Hem iceri alinip hem disari veriliyor — salt re-export yerel kapsama
// getirmez, asagidaki kullanimlar tanimsiz kalirdi.
import { STORY_WIDTH, STORY_HEIGHT } from "../../domain/share/storySticker";

export { STORY_WIDTH, STORY_HEIGHT };

const BODIES = {
  [STORY_KIND.ISTATISTIK]: StoryStatsBody,
  [STORY_KIND.SADE]: StorySimpleBody,
  [STORY_KIND.SERI]: StoryStreakBody,
  [STORY_KIND.ROTA]: StoryRouteBody,
  [STORY_KIND.KART]: StoryCardBody,
  [STORY_KIND.GERISAYIM]: StoryCountdownBody,
  [STORY_KIND.NET]: StoryNetBody,
  [STORY_KIND.DURUST]: StoryHonestBody,
  [STORY_KIND.IZ]: StoryTrackBody,
};

/**
 * Tek bir story etiketi. `ref` view-shot'in yakaladigi dugumdur.
 *
 * `overlay`: Instagram'a giden hal -- HER varyantta ZEMIN YOK, arkasi seffaf,
 * yalniz veriler (fotograf paleti: beyaz + golge, her fotografta okunur).
 * Eskiden marka varyantlari zeminiyle birlikte tam ekran goruntu olarak
 * gidiyordu: hikayede tasinamiyor, arkasina kendi fotografi konamiyordu.
 * Onizleme ve galeriye kaydetmede zemin cizilir.
 */
export const StorySticker = forwardRef(function StorySticker({ variant, photoUri, overlay = false }, ref) {
  const C = useC();
  if (!variant) return null;
  const Body = BODIES[variant.kind];
  if (!Body) return null;

  const p = storyPalette(C, overlay ? STORY_BG.FOTO : variant.background);
  return (
    <View ref={ref} collapsable={false} style={[s.canvas, { backgroundColor: overlay ? "transparent" : C.bg }]}>
      {overlay ? null : p.photo ? (
        <PhotoBackground uri={photoUri} label="FOTOĞRAF SEÇ" />
      ) : (
        <BrandBackground C={C} width={STORY_WIDTH} height={STORY_HEIGHT} />
      )}

      <Body data={variant.data} p={p} C={C} />

      {variant.kind !== STORY_KIND.KART && variant.kind !== STORY_KIND.IZ ? (
        <StoryFoot p={p} daysToExam={variant.data.daysToExam} />
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  canvas: { width: STORY_WIDTH, height: STORY_HEIGHT, overflow: "hidden" },
});
