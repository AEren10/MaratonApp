import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { useC, useTheme } from "../../contexts/ThemeContext";
import { subjectColorOf } from "../../themes/subjectPalette";

// EKRAN DERINLIGI
//
// Duz `bg` ekranlari yassi gosteriyordu (kullanici, 29 Eylul). Kirmizi isima
// her ekrana yayilmiyor: kirmizi aksiyon ve marka rengi, her yerde olursa
// dugmeler one cikmaz. Onun yerine:
//  - ustten inen cok hafif, NOTR bir isik (ekranin ust ~%40'inda soner)
//  - ders baglamindaki ekranda (route.params.subjectKey) o dersin renginden
//    sag ustte cok hafif bir ton
// Katman icerigin USTUNDE ve dokunmayi gecirir: ekranlar kendi zeminini
// opak boyadigi icin altta kalsa gorunmezdi. Opaklik metin kontrastini
// olculemeyecek kadar az degistirir.
// Yalniz koyu tema: acik temada ayni isik yuzeyi kirletir.
const TOP_LIGHT = 0.055;
const SUBJECT_TINT = 0.1;

export const ScreenDepth = memo(function ScreenDepth({ subjectKey = null }) {
  const C = useC();
  const { isDark } = useTheme();
  if (!isDark) return null;
  const tint = subjectKey ? subjectColorOf(C, subjectKey) : null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sd-top" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.text} stopOpacity={TOP_LIGHT} />
            <Stop offset="0.42" stopColor={C.text} stopOpacity={0} />
          </LinearGradient>
          {tint ? (
            <RadialGradient id="sd-tint" cx="92%" cy="0%" r="70%">
              <Stop offset="0" stopColor={tint} stopOpacity={SUBJECT_TINT} />
              <Stop offset="1" stopColor={tint} stopOpacity={0} />
            </RadialGradient>
          ) : null}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sd-top)" />
        {tint ? <Rect x="0" y="0" width="100%" height="100%" fill="url(#sd-tint)" /> : null}
      </Svg>
    </View>
  );
});
