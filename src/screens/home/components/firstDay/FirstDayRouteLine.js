import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from "react-native-reanimated";

import { useC } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";

const W = 390;
const H = 210;
const PATH = "M 26 176 C 110 164 158 128 206 100 C 266 66 316 46 364 30";
// 178 durak tek tek cizilemez. Seyrek temsil: yapi gorunur, sayim yapilmaz.
const TICKS = 24;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Kubik bezier uzerinde t noktasi — tik dugumlerini hattin USTUNE koymak icin.
const P = [[26, 176], [110, 164], [158, 128], [206, 100], [266, 66], [316, 46], [364, 30]];
function pointAt(t) {
  // Iki ardisik kubik parca: 0-0.5 ilki, 0.5-1 ikincisi.
  const seg = t < 0.5 ? 0 : 1;
  const lt = seg === 0 ? t / 0.5 : (t - 0.5) / 0.5;
  const c = seg === 0 ? [P[0], P[1], P[2], P[3]] : [P[3], P[4], P[5], P[6]];
  const m = 1 - lt;
  const x = m * m * m * c[0][0] + 3 * m * m * lt * c[1][0] + 3 * m * lt * lt * c[2][0] + lt * lt * lt * c[3][0];
  const y = m * m * m * c[0][1] + 3 * m * m * lt * c[1][1] + 3 * m * lt * lt * c[2][1] + lt * lt * lt * c[3][1];
  return [x, y];
}

// ROTA HATTI — markanin imzasi, ekranin sahibi.
//
// Hat KESIKLI kalir: tamamlanmis durak yok, dolu bir cizgi olmayan bir
// ilerlemeyi ima ederdi. Metin de zaten "her durak gectiginde bu cizgi biraz
// daha uzuyor" diye soz veriyor; doldurursak o sozu ilk saniyede bozariz.
//
// Iki UCU biliyoruz: kullanici baslangic ve hedef netini kurulumda kendi
// girdi. Once "BURADASIN" dugumu sayisiz duruyordu -- uygulama kullanicinin
// nerede oldugunu biliyor ama soylemiyordu.
export function FirstDayRouteLine({ declared, stopCount, onPress }) {
  const C = useC();
  const draw = useSharedValue(0);

  useEffect(() => {
    draw.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [draw]);

  const animatedProps = useAnimatedProps(() => ({ opacity: draw.value }));

  const ticks = Number.isFinite(stopCount) && stopCount > 0
    ? Array.from({ length: TICKS }, (_, i) => pointAt((i + 1) / (TICKS + 1)))
    : [];

  const label = [
    declared?.startLabel ? `Buradasın ${declared.startLabel}` : "Buradasın",
    declared?.goalLabel ? `hedefin ${declared.goalLabel}` : null,
    stopCount ? `${stopCount} durak` : null,
  ].filter(Boolean).join(", ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Rotanı aç. ${label}`}
      style={({ pressed }) => [s.wrap, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Svg viewBox={`0 0 ${W} ${H}`} style={s.svg}>
        {/* Yurunmemis yol KESIKLI kalir. Cizim animasyonu icin dasharray'i
            kullanmak, animasyon bitince cizgiyi DOLU birakiyordu -- yani
            yurunmemis yolu yurunmus gibi gosteriyordu. Bunun yerine hat
            sabit kesikli, beliren sey opaklik. */}
        <AnimatedPath
          d={PATH}
          fill="none"
          stroke={C.text5}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray="2 9"
          animatedProps={animatedProps}
        />

        {/* 178 durak: sayilmaz ama GORULUR. */}
        {ticks.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={2.1} fill={C.text4} />
        ))}

        <Circle cx={26} cy={176} r={13} fill={C.accent} fillOpacity={0.14} />
        <Circle cx={26} cy={176} r={7} fill={C.accent} />
        <Circle cx={364} cy={30} r={6.5} fill={C.bg} stroke={C.text5} strokeWidth={2.4} />
      </Svg>

      <View style={s.here}>
        {declared?.startLabel ? (
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{declared.startLabel}</Text>
        ) : null}
        <Text style={[TYPOGRAPHY.label, s.cap, { color: C.accentBright }]}>BURADASIN</Text>
      </View>

      {declared?.goalLabel ? (
        <View style={s.target}>
          <Text style={[TYPOGRAPHY.tableValue, s.right, { color: C.text }]}>{declared.goalLabel}</Text>
          <Text style={[TYPOGRAPHY.label, [s.cap, s.right], { color: C.text3 }]}>HEDEFİN</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 + 2 },
  svg: { width: "100%", aspectRatio: W / H },
  here: { position: "absolute", left: "7%", bottom: 0 },
  target: { position: "absolute", right: "6%", top: "2%", alignItems: "flex-end" },
  cap: { fontFamily: TYPOGRAPHY.button.fontFamily, fontSize: TYPOGRAPHY.tableHead.fontSize },
  right: { textAlign: "right" },
});
