import { useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { useStoryShare } from "../../hooks/useStoryShare";
import { STORY_BG, STORY_MOMENT } from "../../domain/share/storySticker";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { StorySticker, STORY_WIDTH, STORY_HEIGHT } from "./StorySticker";
import { Press } from "../../components/design/Press";

const THUMB_W = 124;
const SELECTED_W = 148;

const MESSAGE = {
  placed: "Instagram'a gönderildi.",
  opened: "Etiket panoda. Instagram'da basılı tut, Yapıştır'a dokun.",
  copied: "Etiket panoya kopyalandı. Instagram'ı açıp yapıştırabilirsin.",
  failed: "Etiket hazırlanamadı. Tekrar dener misin?",
};

// PAYLAŞ BLOĞU — tasarim: ayri ekran yok, ozetin icinde yasar. Hazir
// varyantlar yatay kayar, tek buton paylasir.
// emphasis: tek basina duran yuzeyde "primary" (tasarimin dolgulu butonu).
// Ekranda zaten birincil bir aksiyon varsa "quiet" — iki birincil buton olmaz.
export function StoryShareBlock({ moment = STORY_MOMENT.GENERIC, photoUri, emphasis = "primary" }) {
  const C = useC();
  const shotRef = useRef(null);
  const overlayRef = useRef(null);
  const s = useStoryShare(moment);
  const quiet = emphasis === "quiet";
  const photoMode = s.selected?.background === STORY_BG.FOTO;
  const bgUri = s.photo?.uri || photoUri;

  if (s.loading || !s.selected) return null;

  return (
    <View style={[st.wrap, { borderTopColor: C.line, backgroundColor: C.surface }]}>
      <Text style={[TYPOGRAPHY.label, st.head, { color: C.text2 }]}>PAYLAŞ</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.rail}>
        {s.variants.map((v, i) => {
          const active = i === s.selectedIndex;
          const w = active ? SELECTED_W : THUMB_W;
          return (
            <Press haptic="none"
              key={v.key}
              onPress={() => { H.tap(); s.select(i); }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                st.thumb,
                {
                  width: w,
                  height: Math.round((w * STORY_HEIGHT) / STORY_WIDTH),
                  borderColor: active ? C.accent : C.border,
                  opacity: active ? 1 : 0.62,
                },
              ]}
            >
              <View style={[st.scaled, { transform: [{ scale: w / STORY_WIDTH }] }]} pointerEvents="none">
                <StorySticker variant={v} photoUri={bgUri} />
              </View>
            </Press>
          );
        })}
      </ScrollView>

      {/* Strava modeli: fotograf burada secilir ya da o an cekilir, Instagram'a
          zemin olarak gider; veriler ustune seffaf etiket olarak biner. */}
      {photoMode ? (
        <View style={st.photoRow}>
          <Press haptic="none" onPress={() => { H.tap(); s.pickPhoto("library"); }} accessibilityRole="button" style={st.secondary}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentBright }]}>
              {bgUri ? "Fotoğrafı değiştir" : "Galeriden seç"}
            </Text>
          </Press>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>·</Text>
          <Press haptic="none" onPress={() => { H.tap(); s.pickPhoto("camera"); }} accessibilityRole="button" style={st.secondary}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentBright }]}>Kamerayla çek</Text>
          </Press>
        </View>
      ) : null}

      <Press haptic="none"
        onPress={() => { H.tap(); s.share(overlayRef, shotRef); }}
        disabled={s.busy}
        accessibilityRole="button"
        accessibilityLabel="Paylaş"
        style={[
          st.cta,
          quiet
            ? { borderWidth: 1, borderColor: C.border, backgroundColor: "transparent" }
            : { backgroundColor: C.accent },
          { opacity: s.busy ? 0.6 : 1}
        ]}
      >
        <Text style={[TYPOGRAPHY.button, { color: quiet ? C.text : C.accentInk }]}>
          {s.busy ? "Hazırlanıyor…" : "Paylaş"}
        </Text>
      </Press>


      <Text style={[TYPOGRAPHY.micro, st.note, { color: C.text3 }]}>
        {s.result ? MESSAGE[s.result] : photoMode
          ? "Veriler fotoğrafının üstüne biner; Instagram'da taşıyıp büyütebilirsin."
          : "Kartın Instagram story'ne gönderilir."}
      </Text>

      {/* Yakalanan asil etiketler: tam olcu, EKRAN DISINDA. Eskiden sol ustte
          duruyordu; zIndex RN'de gizlemedigi icin ozetin ustune biniyordu. */}
      <View style={st.offscreen} pointerEvents="none">
        <StorySticker ref={shotRef} variant={s.selected} photoUri={bgUri} />
        <StorySticker ref={overlayRef} variant={s.selected} overlay />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  head: { paddingHorizontal: STEP.s3 },
  rail: { gap: STEP.s2, paddingHorizontal: STEP.s3, paddingTop: STEP.s2, alignItems: "flex-start" },
  thumb: { borderRadius: SHAPE.card, borderWidth: 1, overflow: "hidden" },
  scaled: { position: "absolute", left: 0, top: 0, transformOrigin: "top left" },
  cta: {
    height: 52, marginHorizontal: STEP.s3, marginTop: STEP.s3,
    borderRadius: SHAPE.button, alignItems: "center", justifyContent: "center",
  },
  secondary: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: STEP.s1 },
  photoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: STEP.s2 },
  note: { textAlign: "center", paddingHorizontal: STEP.s4, marginTop: STEP.s1 },
  offscreen: { position: "absolute", top: 0, left: -10000 },
});
