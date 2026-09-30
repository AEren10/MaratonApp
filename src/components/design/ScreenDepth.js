import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { useC, useTheme } from "../../contexts/ThemeContext";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useDepthTone } from "../../lib/depthTone";

// EKRAN DERİNLİĞİ
//
// Düz `bg` ekranları yassı gösteriyordu (kullanıcı, 29 Eylül). Kırmızı ışıma
// her ekrana yayılmıyor: kırmızı aksiyon ve marka rengi, her yerde olursa
// düğmeler öne çıkmaz. Onun yerine:
//  - üstten inen çok hafif, NÖTR bir ışık (ekranın üst ~%45'inde söner)
//  - ders bağlamındaki ekranda (route.params.subjectKey) o dersin renginden
//    sağ üstte çok hafif bir ton
// Katman içeriğin ÜSTÜNDE ve dokunmayı geçirir: ekranlar kendi zeminini
// opak boyadığı için altta kalsa görünmezdi.

// Koyu tema sabitleri
const TOP_LIGHT_DARK = 0.065;
const SUBJECT_TINT_DARK = 0.14;
const STATE_TINT_DARK = 0.12;

// Açık tema sabitleri (Brief 22)
// Beyazdan (#FFFFFF) zemine inen yumuşak parlaklık, ekranın üst ~%45'inde söner.
const TOP_LIGHT_LIGHT = 0.55;
const SUBJECT_TINT_LIGHT = 0.10;
const STATE_TINT_LIGHT = 0.08;

export const ScreenDepth = memo(function ScreenDepth({ subjectKey = null, home = false }) {
  const C = useC();
  const { isDark } = useTheme();
  const state = useDepthTone();

  const stateColor = home ? ({ up: C.up, warn: C.warn }[state] || null) : null;
  const tint = stateColor || (subjectKey ? subjectColorOf(C, subjectKey) : null);

  const topColor = isDark ? C.text : "#FFFFFF";
  const topOpacity = isDark ? TOP_LIGHT_DARK : TOP_LIGHT_LIGHT;
  const topStop = isDark ? "0.5" : "0.45";

  const tintOpacity = isDark
    ? (stateColor ? STATE_TINT_DARK : SUBJECT_TINT_DARK)
    : (stateColor ? STATE_TINT_LIGHT : SUBJECT_TINT_LIGHT);
  const tintX = stateColor ? "50%" : "92%";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sd-top" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={topColor} stopOpacity={topOpacity} />
            <Stop offset={topStop} stopColor={topColor} stopOpacity={0} />
          </LinearGradient>
          {tint ? (
            <RadialGradient id="sd-tint" cx={tintX} cy="0%" r="70%">
              <Stop offset="0" stopColor={tint} stopOpacity={tintOpacity} />
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
