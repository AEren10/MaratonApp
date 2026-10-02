import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";
import { StoryFoot } from "../StoryFoot";

const TZ = "Europe/Istanbul";

function todayLabel() {
  return new Date()
    .toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: TZ })
    .toLocaleUpperCase("tr");
}

export function StoryCardBody({ data, p, visibility = {} }) {
  const {
    showQuestions = true,
    showMinutes = true,
    showChart = true,
    showStops = true,
    showAccuracy = true,
  } = visibility;

  const pts = showChart && data.series?.length > 1
    ? scalePoints(data.series, { width: 330, height: 70, padTop: 8, padBottom: 8 })
    : null;
  const last = pts ? pts[pts.length - 1] : null;

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[s.date, { color: p.dim }, p.shadow]}>{todayLabel()}</Text>
        <Text style={[s.dotsDivider, { color: p.rule }]}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
      </View>

      <View style={s.body}>
        {showQuestions ? (
          <View style={s.heroGroup}>
            <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[s.heroLabel, { color: p.mid }, p.shadow]}>SORU TAMAMLANDI</Text>
          </View>
        ) : null}

        <View style={s.dataRow}>
          {showMinutes && data.minutes != null ? (
            <View style={s.dataItem}>
              <Text style={[s.dataLabel, { color: p.dim }, p.shadow]}>SÜRE</Text>
              <Text style={[s.dataVal, { color: p.solid }, p.shadow]}>{formatMinutes(data.minutes)}</Text>
            </View>
          ) : null}
          {showAccuracy && data.accuracy != null ? (
            <View style={s.dataItem}>
              <Text style={[s.dataLabel, { color: p.dim }, p.shadow]}>İSABET</Text>
              <Text style={[s.dataVal, { color: p.up }, p.shadow]}>{`%${Math.round(data.accuracy)}`}</Text>
            </View>
          ) : null}
          {showStops && data.stops != null ? (
            <View style={s.dataItem}>
              <Text style={[s.dataLabel, { color: p.dim }, p.shadow]}>DURAK</Text>
              <Text style={[s.dataVal, { color: p.solid }, p.shadow]}>{`${data.stops} Durak`}</Text>
            </View>
          ) : null}
        </View>

        {pts ? (
          <View style={s.chartBox}>
            <Svg width="100%" height={70} viewBox="0 0 330 70">
              <Path d={buildSmoothPath(pts)} stroke={p.accent} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Circle cx={last.x} cy={last.y} r={12} fill={p.accent} fillOpacity={0.25} />
              <Circle cx={last.x} cy={last.y} r={6} fill={p.accent} stroke="#FFFFFF" strokeWidth={2} />
            </Svg>
          </View>
        ) : null}
      </View>

      <View style={s.footBox}>
        <Text style={[s.dotsDivider, { color: p.rule }]}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
        <View style={s.barcodeRow}>
          <Svg width={160} height={18} viewBox="0 0 160 18">
            {[4, 12, 16, 26, 32, 36, 48, 54, 60, 72, 80, 88, 98, 106, 114, 126, 134, 142, 150].map((x, i) => (
              <Line key={i} x1={x} y1={2} x2={x} y2={16} stroke="rgba(255,255,255,0.45)" strokeWidth={i % 3 === 0 ? 2.8 : 1.4} />
            ))}
          </Svg>
          <Text style={[s.receiptNo, { color: p.dim }]}>#M-2026-STUDY</Text>
        </View>
        <StoryFoot p={p} inline centered />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  head: { width: 330, gap: 4 },
  date: { fontFamily: "Archivo_600", fontSize: 12, letterSpacing: 1.2 },
  dotsDivider: { letterSpacing: 2, fontSize: 11, opacity: 0.5, marginVertical: 4 },
  body: { width: 330, gap: 10 },
  heroGroup: { gap: 2 },
  heroNum: { fontFamily: "Bricolage_400", fontSize: 84, lineHeight: 88, letterSpacing: -4 },
  heroLabel: { fontFamily: "Archivo_700", fontSize: 13, letterSpacing: 1.8 },
  dataRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  dataItem: { gap: 2 },
  dataLabel: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.4 },
  dataVal: { fontFamily: "Bricolage_400", fontSize: 22 },
  chartBox: { marginTop: 4 },
  footBox: { width: 330, gap: 6, marginTop: 4 },
  barcodeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  receiptNo: { fontFamily: "Archivo_500", fontSize: 11, letterSpacing: 1.2 },
});
