import { View, Text } from "react-native";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { buildLinePath } from "../../../lib/routeChartPath";
import { useYearActivity } from "../../../hooks/useYearActivity";

const VB_W = 346;
const VB_H = 108;
const PAD_X = 12;
const BASE_Y = 78;
const NODE_STEP_Y = 13;

// "YILIN ROTASI": tasarimin egrisi bezier smooth() ile cizilir, projede
// bir egri-yumusatma yardimcisi yok (routeChartPath sadece duz L segment
// uretiyor) — bu yuzden hat duz kirik cizgi, egri DEGIL. Gorsel niyet
// (durak = ay, dugum capi = yogunluk) korunuyor.
export function YearRouteChart() {
  const C = useC();
  const { months, currentMonthIndex, activeThisMonth, currentMonthLabel, year } = useYearActivity();

  const stepX = months.length > 1 ? (VB_W - PAD_X * 2) / (months.length - 1) : 0;
  const points = months.map((m, i) => ({
    x: PAD_X + i * stepX,
    y: BASE_Y - m.level * NODE_STEP_Y,
    ...m,
  }));
  const trackD = buildLinePath(points);
  const pastD = buildLinePath(points.slice(0, currentMonthIndex + 1));
  const heat = [C.heat1, C.heat1, C.heat2, C.heat3, C.heat4];

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 + 4 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: STEP.s2 }}>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 2, color: C.text2 }}>
          {`YILIN ROTASI · ${year}`}
        </Text>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 12, color: C.text }}>
          {`${activeThisMonth} aktif gün · ${currentMonthLabel}`}
        </Text>
      </View>

      <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", aspectRatio: VB_W / VB_H }}>
        <Path d={trackD} fill="none" stroke={C.track} strokeWidth={2.4} strokeLinecap="round" />
        <Path d={pastD} fill="none" stroke={C.accent} strokeWidth={2.8} strokeLinecap="round" opacity={0.5} />
        {points.map((p, i) => (
          <Circle
            key={p.label}
            cx={p.x} cy={p.y}
            r={p.level === 0 ? 4 : 4 + p.level * 1.7}
            fill={p.level === 0 ? C.bg : heat[p.level]}
            stroke={p.level === 0 ? C.track : C.accent}
            strokeWidth={2}
          />
        ))}
        {points.map((p, i) => (
          <SvgText
            key={"lbl-" + p.label}
            x={p.x}
            y={p.y + (p.level === 0 ? 18 : 20)}
            fontSize={11}
            fontFamily="Archivo_700"
            textAnchor="middle"
            fill={i === currentMonthIndex ? C.text : (p.level === 0 ? C.text4 : C.text3)}
          >
            {p.label}
          </SvgText>
        ))}
      </Svg>

      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingTop: STEP.s2 }}>
        <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>az</Text>
        <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
          {[C.track, C.heat1, C.heat2, C.heat3, C.heat4].map((bg, i) => (
            <View key={i} style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: bg }} />
          ))}
        </View>
        <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>yoğun</Text>
      </View>
    </View>
  );
}
