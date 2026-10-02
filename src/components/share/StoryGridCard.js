import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { SHAPE, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";
import { CheckerboardBackground } from "./CheckerboardBackground";
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
}) {
  const C = useC();
  const scale = width / STORY_WIDTH;
  const label = KIND_NAMES[variant.kind] || variant.kind.toLocaleUpperCase("tr");

  return (
    <Press
      haptic="none"
      onPress={() => {
        H.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        s.card,
        {
          width,
          height,
          borderColor: active ? "#FFFFFF" : C.border,
          borderWidth: active ? 2.5 : 1,
          opacity: active ? 1 : 0.65,
        },
      ]}
    >
      {/* Zemin: Fotograf varsa fotograf, yoksa dama tahtasi seffaf deseni */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <CheckerboardBackground />
      )}

      {/* Olcekli Sticker */}
      <View style={[s.scaled, { transform: [{ scale }] }]} pointerEvents="none">
        <StorySticker variant={variant} overlay visibility={visibility} />
      </View>

      {/* Sol ust etiket rozeti */}
      <View style={[s.tagBadge, { backgroundColor: active ? C.accent : "rgba(30,30,36,0.85)" }]}>
        <Text style={[TYPOGRAPHY.micro, s.tagText, { color: active ? C.accentInk : C.text2 }]}>
          {label}
        </Text>
      </View>

      {/* Sag ust secim tiki */}
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
  card: {
    borderRadius: SHAPE.cardTight,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#16161D",
  },
  scaled: {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: "top left",
  },
  tagBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: "Archivo_700",
    fontSize: 9.5,
    letterSpacing: 1.1,
  },
  checkCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
