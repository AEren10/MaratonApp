import { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, ActionSheetIOS, Platform } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { useStoryShare } from "../../hooks/useStoryShare";
import { STORY_MOMENT } from "../../domain/share/storySticker";
import { STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import { StorySticker } from "./StorySticker";
import { StoryGridCard } from "./StoryGridCard";
import { StoryFilterChips } from "./StoryFilterChips";
import { StoryActionRow } from "./StoryActionRow";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_GAP = 12;
const CARD_W = Math.floor((SCREEN_W - GUTTER * 2 - GRID_GAP) / 2);
const CARD_H = Math.round(CARD_W * (16 / 9));

const STATUS_TEXTS = {
  placed: "Instagram'a aktarıldı ✓",
  opened: "Instagram kamerası açıldı — basılı tutup yapıştır.",
  tiktok_opened: "TikTok açıldı — Hikayende 'Çıkartma' olarak yapıştırabilirsin ✓",
  copied: "Şeffaf etiket panoya kopyalandı ✓",
  saved: "Galeriye kaydedildi ✓",
  permission_denied: "İzin verilmedi.",
  failed: "İşlem tamamlanamadı, tekrar dener misin?",
};

export function StoryShareBlock({ moment = STORY_MOMENT.GENERIC }) {
  const C = useC();
  const overlayRef = useRef(null);
  const s = useStoryShare(moment);

  const [visibility, setVisibility] = useState({
    showQuestions: true, showMinutes: true, showStreak: true, showChart: true,
    showStops: true, showAccuracy: true, showWeek: true, showDays: true, showCountdown: true,
  });

  const handleToggle = useCallback((key) => {
    setVisibility((prev) => ({ ...prev, [key]: prev[key] === false }));
  }, []);

  const handlePickPhoto = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["İptal", "Kamerayla Çek", "Galeriden Seç"], cancelButtonIndex: 0 },
        (i) => { if (i === 1) s.pickPhoto("camera"); if (i === 2) s.pickPhoto("library"); }
      );
    } else {
      s.pickPhoto("library");
    }
  }, [s]);

  if (s.loading || !s.selected) return null;

  return (
    <View style={[st.wrap, { backgroundColor: C.surface, borderTopColor: C.line }]}>
      {/* Baslik */}
      <View style={st.headerRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>HİKAYEDE PAYLAŞ</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
          {s.selectedIndex + 1} / {s.variants.length} Şablon
        </Text>
      </View>

      {/* Strava Tarzı 2x2 Grid */}
      <View style={st.grid}>
        {s.variants.map((v, i) => (
          <StoryGridCard
            key={v.key}
            variant={v}
            photoUri={s.photo?.uri}
            active={i === s.selectedIndex}
            width={CARD_W}
            height={CARD_H}
            visibility={visibility}
            onPress={() => s.select(i)}
          />
        ))}
      </View>

      {/* İcindeki Verileri Kapatip Acma Secenekleri */}
      <StoryFilterChips
        kind={s.selected.kind}
        data={s.selected.data}
        visibility={visibility}
        onToggle={handleToggle}
      />

      {/* Strava Tarzi Dairesel Butonlar */}
      <StoryActionRow
        onShareInstagram={() => s.share(overlayRef)}
        onShareTikTok={() => s.shareTikTok(overlayRef)}
        onCopyToClipboard={() => s.copy(overlayRef)}
        onSaveToGallery={() => s.save(overlayRef)}
        onPickPhoto={handlePickPhoto}
        onClearPhoto={s.clearPhoto}
        hasPhoto={!!s.photo}
        busy={s.busy}
      />

      {/* Geri Bildirim Mesaji */}
      <Text style={[TYPOGRAPHY.micro, st.statusNote, { color: s.result ? C.up : C.text3 }]}>
        {s.result ? STATUS_TEXTS[s.result] || "" : s.photo
          ? "Fotoğrafın arka planda, sticker önde açılır. Instagram'da taşıyabilirsin."
          : "Şeffaf etiket Instagram'a biner; arka planı Instagram'da dilediğince seçebilirsin."}
      </Text>

      {/* Ekran Disinda Tam Olculu Yakalama */}
      <View style={st.offscreen} pointerEvents="none">
        <StorySticker
          ref={overlayRef}
          variant={s.selected}
          overlay
          visibility={visibility}
        />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingTop: STEP.s3, paddingBottom: STEP.s5 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    marginBottom: STEP.s2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GUTTER,
    gap: GRID_GAP,
    justifyContent: "space-between",
  },
  statusNote: { textAlign: "center", paddingHorizontal: GUTTER, marginTop: STEP.s2 },
  offscreen: { position: "absolute", top: 0, left: -10000 },
});
