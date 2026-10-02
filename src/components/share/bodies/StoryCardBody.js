import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";

import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";
import { alpha } from "../../../themes/colorMix";
import { StoryFoot } from "../StoryFoot";

const TZ = "Europe/Istanbul";

function todayLabel() {
  return new Date()
    .toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: TZ })
    .toLocaleUpperCase("tr");
}

export function StoryCardBody({ data, p, C, visibility = {} }) {
  const {
    showQuestions = true,
    showMinutes = true,
    showStreak = true,
    showChart = true,
    showStops = true,
    showAccuracy = true,
    showCountdown = true,
  } = visibility;

  const pts = showChart && data.series?.length > 1
    ? scalePoints(data.series, { width: 340, height: 80, padTop: 10, padBottom: 10 })
    : null;
  const last = pts ? pts[pts.length - 1] : null;

  return (
    <View style={s.wrap}>
      {/* Fiş / Rapor Başlığı */}
      <View style={s.head}>
        <View style={s.topRow}>
          <Text style={[s.badge, { color: p.accent }, p.shadow]}>✦ GÜNLÜK ÇALIŞMA RAPORU ✦</Text>
          {showStreak && data.streak != null ? (
            <View style={[s.chip, { backgroundColor: alpha(p.accent, 20), borderColor: p.accent }]}>
              <Text style={[s.chipText, { color: p.accent }]}>{`SERİ ${data.streak} GÜN 🔥`}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[s.date, { color: p.dim }, p.shadow]}>{todayLabel()}</Text>
        <Text style={[s.dotsDivider, { color: p.rule }]}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
      </View>

      {/* Ana Kahraman Sayılar */}
      <View style={s.body}>
        {showQuestions ? (
          <View style={s.heroGroup}>
            <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[s.heroLabel, { color: p.mid }, p.shadow]}>SORU ÇÖZÜLDÜ</Text>
          </View>
        ) : null}

        {/* 3'lü İnce Veri Satırı */}
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
              <Text style={[s.dataVal, { color: p.up || "#34D399" }, p.shadow]}>{`%${Math.round(data.accuracy)}`}</Text>
            </View>
          ) : null}
          {showStops && data.stops != null ? (
            <View style={s.dataItem}>
              <Text style={[s.dataLabel, { color: p.dim }, p.shadow]}>DURAK</Text>
              <Text style={[s.dataVal, { color: p.solid }, p.shadow]}>{`${data.stops} Durak`}</Text>
            </View>
          ) : null}
        </View>

        {/* Mini Günlük Trend Eğrisi */}
        {pts ? (
          <View style={s.chartBox}>
            <Svg width="100%" height={80} viewBox="0 0 340 80">
              <Path d={buildSmoothPath(pts)} stroke={p.accent} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Circle cx={last.x} cy={last.y} r={14} fill={p.accent} fillOpacity={0.25} />
              <Circle cx={last.x} cy={last.y} r={7} fill={p.accent} stroke="#FFFFFF" strokeWidth={2} />
            </Svg>
          </View>
        ) : null}
      </View>

      {/* Alt Fiş İmzası ve Barkod */}
      <View style={s.footBox}>
        <Text style={[s.dotsDivider, { color: p.rule }]}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
        <View style={s.barcodeRow}>
          <Svg width={180} height={22} viewBox="0 0 180 22">
            {[4, 12, 16, 26, 32, 36, 48, 54, 60, 72, 80, 88, 98, 106, 114, 126, 134, 142, 154, 164, 172].map((x, i) => (
              <Line key={i} x1={x} y1={2} x2={x} y2={20} stroke="rgba(255,255,255,0.4)" strokeWidth={i % 3 === 0 ? 3 : 1.5} />
            ))}
          </Svg>
          <Text style={[s.receiptNo, { color: p.dim }]}>#M-2026-STUDY</Text>
        </View>
        <StoryFoot p={p} daysToExam={showCountdown ? data.daysToExam : null} inline />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingTop: 70, paddingHorizontal: 30, paddingBottom: 64, justifyContent: "space-between" },
  head: { gap: 6 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.5 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  chipText: { fontFamily: "Archivo_700", fontSize: 10.5, letterSpacing: 1 },
  date: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
  dotsDivider: { letterSpacing: 2, fontSize: 11, opacity: 0.5, marginVertical: 4 },
  body: { gap: 14 },
  heroGroup: { gap: 2 },
  heroNum: { fontFamily: "Bricolage_400", fontSize: 104, lineHeight: 108, letterSpacing: -5 },
  heroLabel: { fontFamily: "Archivo_600", fontSize: 13, letterSpacing: 2 },
  dataRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  dataItem: { gap: 3 },
  dataLabel: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.5 },
  dataVal: { fontFamily: "Bricolage_400", fontSize: 22 },
  chartBox: { marginTop: 8 },
  footBox: { gap: 6 },
  barcodeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  receiptNo: { fontFamily: "Archivo_500", fontSize: 10.5, letterSpacing: 1.2 },
});
