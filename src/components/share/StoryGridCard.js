import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useC } from "../../contexts/ThemeContext";
import { SHAPE, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";
import { StorySticker, STORY_WIDTH, STORY_HEIGHT } from "./StorySticker";

const KIND_NAMES = {
  cubuk: "HAFTALIK RAPOR",
  harita: "HEDEF ROTASI",
  ders: "DERS TRENDİ",
  kart: "GÜNÜN RAPORU",
  net: "DENEME NETİ",
  iz: "GÜNÜN İZİ",
  gerisayim: "GERİ SAYIM",
  seri: "SERİ ATEŞİ",
  rota: "TREND EĞRİSİ",
  istatistik: "İSTATİSTİK",
  sade: "MİNİMAL",
  durust: "DÜRÜST KART",
};

export function StoryGridCard({
  variant,
  photoUri,
  active,
  width,
  height,
  visibility,
  onPress,
  onCycleSubject,
}) {
  const C = useC();
  const scale = width / STORY_WIDTH;
  const isDers = variant.kind === "ders";
  const label = isDers
    ? `${(variant.data?.label || "Matematik").toLocaleUpperCase("tr")}${active ? " ↺" : ""}`
    : (KIND_NAMES[variant.kind] || variant.kind.toLocaleUpperCase("tr"));

  const handlePress = () => {
    H.tap();
    if (active && isDers) {
      onCycleSubject?.();
    } else {
      onPress();
    }
  };

  return (
    <Press
      haptic="none"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        s.card,
        {
          width,
          height,
          borderColor: active ? C.accentBright || "#FFFFFF" : C.border,
          borderWidth: active ? 2.5 : 1,
          opacity: active ? 1 : 0.72,
        },
      ]}
    >
      {/* Gerçek Kart Önizlemesi (Ortalanmış ve tam oturan ölçek) */}
      <View
        style={{
          position: "absolute",
          left: (width - STORY_WIDTH) / 2,
          top: (height - STORY_HEIGHT) / 2,
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
          transform: [{ scale }],
        }}
        pointerEvents="none"
      >
        <StorySticker variant={variant} photoUri={photoUri} overlay={false} visibility={visibility} />
      </View>

      {/* Sol üst etiket rozeti */}
      <View style={[s.tagBadge, { backgroundColor: active ? C.accent : "rgba(30,30,36,0.88)" }]}>
        <Text style={[TYPOGRAPHY.micro, s.tagText, { color: active ? C.accentInk : C.text2 }]}>
          {label}
        </Text>
      </View>

      {/* Ders kartı için dokunma ipucu */}
      {isDers ? (
        <View style={[s.cyclePill, { backgroundColor: active ? C.accent : "rgba(22,22,29,0.92)" }]}>
          <Text style={[s.cycleText, { color: active ? C.accentInk : C.text }]}>
            {active ? "Ders değiştir ↺" : "Dokun · Dersler arası gez"}
          </Text>
        </View>
      ) : null}

      {/* Sağ üst seçim tiki */}
      {active ? (
        <View style={s.checkCircle}>
          <Svg width={12} height={12} viewBox="0 0 14 14">
            <Path
              d="M3 7.5L5.5 10L11 4.5"
              stroke="#000000"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      ) : null}
    </Press>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: SHAPE.cardTight, overflow: "hidden", position: "relative", backgroundColor: "#16161D" },
  tagBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  tagText: { fontFamily: "Archivo_700", fontSize: 10.5, letterSpacing: 1 },
  cyclePill: { position: "absolute", bottom: 8, left: 8, right: 8, paddingVertical: 4, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  cycleText: { fontFamily: "Archivo_600", fontSize: 10, letterSpacing: 0.4 },
  checkCircle: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
