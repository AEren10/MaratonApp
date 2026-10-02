import { useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { useStoryShare } from "../../hooks/useStoryShare";
import { STORY_MOMENT } from "../../domain/share/storySticker";
import { SHAPE, STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { StorySticker, STORY_WIDTH, STORY_HEIGHT } from "./StorySticker";
import { Press } from "../../components/design/Press";

const THUMB_W = 108;
const SELECTED_W = 148;
const THUMB_RATIO = STORY_HEIGHT / STORY_WIDTH;

const FEEDBACK = {
  placed: "Instagram'a gönderildi ✓",
  opened: "Etiket panoda — Instagram'da basılı tut, Yapıştır'a dokun.",
  copied: "Panoya kopyalandı. Instagram'ı aç, yapıştır.",
  saved: "Galeriye kaydedildi ✓",
  failed: "Bir sorun oldu, tekrar dene.",
  permission_denied: "Galeri izni verilmedi.",
};

// Sablon adlari — kullaniciya ne sectigini soyleyen kisa etiketler.
const KIND_LABEL = {
  kart: "Kart",
  istatistik: "İstatistik",
  rota: "Grafik",
  sade: "Minimal",
  gerisayim: "Geri Sayım",
  seri: "Seri",
  net: "Net",
  durust: "Dürüst",
  iz: "İz",
};

export function StoryShareBlock({ moment = STORY_MOMENT.GENERIC, emphasis = "primary" }) {
  const C = useC();
  const overlayRef = useRef(null);
  const s = useStoryShare(moment);
  const quiet = emphasis === "quiet";

  if (s.loading || !s.selected) return null;

  return (
    <View style={[st.wrap, { backgroundColor: C.surface, borderTopColor: C.line }]}>
      {/* Baslik */}
      <Text style={[TYPOGRAPHY.label, st.head, { color: C.text2 }]}>ŞABLON SEÇ</Text>

      {/* Yatay sablon carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.rail}
      >
        {s.variants.map((v, i) => {
          const active = i === s.selectedIndex;
          const w = active ? SELECTED_W : THUMB_W;
          const h = Math.round(w * THUMB_RATIO);
          return (
            <Press
              haptic="none"
              key={v.key}
              onPress={() => { H.tap(); s.select(i); }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                st.thumb,
                {
                  width: w,
                  height: h,
                  borderColor: active ? C.accent : C.border,
                  borderWidth: active ? 2 : 1,
                  opacity: active ? 1 : 0.6,
                },
              ]}
            >
              <View
                style={[st.scaled, { transform: [{ scale: w / STORY_WIDTH }] }]}
                pointerEvents="none"
              >
                <StorySticker variant={v} photoUri={s.photo?.uri} />
              </View>
              {/* Sablon etiketi */}
              <View style={[st.thumbLabel, { backgroundColor: C.elev }]}>
                <Text
                  style={[TYPOGRAPHY.micro, { color: active ? C.text : C.text3 }]}
                  numberOfLines={1}
                >
                  {KIND_LABEL[v.kind] || v.kind}
                </Text>
              </View>
            </Press>
          );
        })}
      </ScrollView>

      {/* Fotograf sec / cek */}
      <View style={st.photoRow}>
        <PhotoButton
          C={C}
          label={s.photo ? "Fotoğrafı değiştir" : "📷 Galeriden seç"}
          onPress={() => { H.tap(); s.pickPhoto("library"); }}
        />
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>·</Text>
        <PhotoButton
          C={C}
          label="📸 Kamerayla çek"
          onPress={() => { H.tap(); s.pickPhoto("camera"); }}
        />
        {s.photo ? (
          <>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>·</Text>
            <PhotoButton
              C={C}
              label="✕ Kaldır"
              onPress={() => { H.tap(); s.clearPhoto(); }}
              dim
            />
          </>
        ) : null}
      </View>

      {/* Aksiyonlar: Paylas + Kaydet */}
      <View style={st.actions}>
        <Press
          haptic="none"
          onPress={() => { H.tap(); s.share(overlayRef); }}
          disabled={s.busy}
          accessibilityRole="button"
          accessibilityLabel="Instagram'da paylaş"
          style={[
            st.cta,
            quiet
              ? { borderWidth: 1, borderColor: C.border, backgroundColor: "transparent" }
              : { backgroundColor: C.accent },
            { opacity: s.busy ? 0.5 : 1 },
          ]}
        >
          <Text style={[TYPOGRAPHY.button, { color: quiet ? C.text : C.accentInk }]}>
            {s.busy ? "Hazırlanıyor…" : "Instagram'da Paylaş"}
          </Text>
        </Press>

        <Press
          haptic="none"
          onPress={() => { H.tap(); s.save(overlayRef); }}
          disabled={s.busy}
          accessibilityRole="button"
          accessibilityLabel="Galeriye kaydet"
          style={[st.secondaryCta, { borderColor: C.border, opacity: s.busy ? 0.5 : 1 }]}
        >
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>Galeriye Kaydet</Text>
        </Press>
      </View>

      {/* Durum mesaji */}
      <Text style={[TYPOGRAPHY.micro, st.note, { color: s.result ? C.up : C.text3 }]}>
        {s.result
          ? FEEDBACK[s.result] || ""
          : s.photo
            ? "Fotoğrafın üstüne sticker olarak gider. Instagram'da taşıyıp büyütebilirsin."
            : "Fotoğraf seçmeden paylaşırsan, Instagram'da kendi kareni çekip yapıştırırsın."}
      </Text>

      {/* Gizli yakalama alani — ekran disinda, tam boyut, overlay (seffaf) */}
      <View style={st.offscreen} pointerEvents="none">
        <StorySticker ref={overlayRef} variant={s.selected} overlay />
      </View>
    </View>
  );
}

// Kucuk fotograf aksiyonu
function PhotoButton({ C, label, onPress, dim }) {
  return (
    <Press haptic="none" onPress={onPress} accessibilityRole="button" style={st.photoBtn}>
      <Text style={[TYPOGRAPHY.captionMedium, { color: dim ? C.text3 : C.accentBright }]}>
        {label}
      </Text>
    </Press>
  );
}

const st = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  head: { paddingHorizontal: GUTTER },
  rail: {
    gap: STEP.s1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    alignItems: "flex-start",
  },
  thumb: {
    borderRadius: SHAPE.card,
    overflow: "hidden",
    position: "relative",
  },
  scaled: {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: "top left",
  },
  thumbLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 4,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    marginTop: STEP.s2,
    flexWrap: "wrap",
  },
  photoBtn: { minHeight: 36, justifyContent: "center", paddingHorizontal: 6 },
  actions: {
    flexDirection: "row",
    gap: STEP.s1,
    paddingHorizontal: GUTTER,
    marginTop: STEP.s3,
  },
  cta: {
    flex: 1,
    height: 52,
    borderRadius: SHAPE.button,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCta: {
    height: 52,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    textAlign: "center",
    paddingHorizontal: STEP.s4,
    marginTop: STEP.s1,
  },
  offscreen: { position: "absolute", top: 0, left: -10000 },
});
