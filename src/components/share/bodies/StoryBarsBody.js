import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Line, Path, G, Text as SvgText } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";

const W = 345;
const H = 220;
const BARS_PAD_BOTTOM = 30;

function fmtMinutes(m) {
  if (!m) return "";
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return h ? (r ? `${h}s ${r}d` : `${h}sa`) : `${r}dk`;
}

export function StoryBarsBody({ data, p, C, visibility = {} }) {
  const {
    showQuestions = true,
    showMinutes = true,
    showDays = true,
    showGoalLine = true,
    showCountdown = true,
  } = visibility;

  const rawDays = data.days?.length ? data.days : [
    { label: "Pzt", questions: 45, minutes: 70 },
    { label: "Sal", questions: 80, minutes: 120 },
    { label: "Çar", questions: 0, minutes: 0 },
    { label: "Per", questions: 110, minutes: 160 },
    { label: "Cum", questions: 65, minutes: 90 },
    { label: "Cmt", questions: 140, minutes: 210 },
    { label: "Paz", questions: 95, minutes: 130 },
  ];

  const maxVal = Math.max(...rawDays.map((d) => d.minutes || d.questions || 0), 60);
  const barAreaH = H - BARS_PAD_BOTTOM;
  const slotW = W / rawDays.length;
  const barW = Math.min(26, slotW * 0.58);
  const goalY = barAreaH * 0.32;

  return (
    <View style={s.wrap}>
      {/* Baslik & Hafta Toplami */}
      <View style={s.head}>
        <Text style={[s.eyebrow, { color: p.accent }, p.shadow]}>✦ BU HAFTANIN RAPORU ✦</Text>
        <View style={s.metricRow}>
          {showQuestions && data.weekQuestions ? (
            <View style={s.statBox}>
              <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{data.weekQuestions}</Text>
              <Text style={[s.heroUnit, { color: p.mid }, p.shadow]}>toplam soru</Text>
            </View>
          ) : null}
          {showMinutes && data.weekMinutes ? (
            <View style={s.statBox}>
              <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{fmtMinutes(data.weekMinutes)}</Text>
              <Text style={[s.heroUnit, { color: p.mid }, p.shadow]}>odaklanma</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 7 Gunluk Kırmızı Cubuk Grafigi */}
      <View style={s.chartBox}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Hedef cizgisi ve minik kirmizi bayrak */}
          {showGoalLine ? (
            <G>
              <Line x1={0} y1={goalY} x2={W - 24} y2={goalY} stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="4 4" />
              <Path d={`M${W - 22},${goalY - 14} L${W - 8},${goalY - 7} L${W - 22},${goalY} Z`} fill={p.accent} />
              <Line x1={W - 22} y1={goalY - 14} x2={W - 22} y2={goalY + 4} stroke={p.accent} strokeWidth={1.5} />
            </G>
          ) : null}

          {/* Gunlerin cubuklari ve etiketleri */}
          {rawDays.map((d, i) => {
            const val = d.minutes || d.questions || 0;
            const h = val > 0 ? Math.max(16, (val / maxVal) * (barAreaH - 30)) : 4;
            const x = i * slotW + (slotW - barW) / 2;
            const y = barAreaH - h;
            const isToday = i === (data.todayIndex ?? 6);

            return (
              <G key={`b-${i}`}>
                {val > 0 && d.minutes ? (
                  <SvgText x={x + barW / 2} y={y - 6} fill={isToday ? p.accent : p.solid} fontSize={10} fontWeight="700" textAnchor="middle">
                    {fmtMinutes(d.minutes)}
                  </SvgText>
                ) : null}
                <Rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={4}
                  fill={isToday ? p.accent : (p.accent || "#E5343F")}
                  fillOpacity={isToday ? 1 : val > 0 ? 0.85 : 0.25}
                />
                {d.questions > 0 && h >= 28 ? (
                  <SvgText x={x + barW / 2} y={barAreaH - 6} fill="#FFFFFF" fontSize={10} fontWeight="700" textAnchor="middle">
                    {d.questions}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
        </Svg>

        {/* Gun isimleri */}
        {showDays ? (
          <View style={s.daysRow}>
            {rawDays.map((d, i) => {
              const isToday = i === (data.todayIndex ?? 6);
              return (
                <View key={`lbl-${i}`} style={{ width: slotW, alignItems: "center" }}>
                  <Text style={[s.dayLbl, { color: isToday ? p.accent : p.dim }, p.shadow]}>
                    {d.label?.slice(0, 3)}
                  </Text>
                  {isToday ? <View style={[s.todayDot, { backgroundColor: p.accent }]} /> : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      <StoryFoot p={p} daysToExam={showCountdown ? data.daysToExam : null} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", paddingHorizontal: 30, paddingTop: 64 },
  head: { gap: 6 },
  eyebrow: { fontFamily: "Archivo_700", fontSize: 12, letterSpacing: 1.6 },
  metricRow: { flexDirection: "row", gap: 24, marginTop: 4 },
  statBox: { gap: 2 },
  heroNum: { fontFamily: "Bricolage_400", fontSize: 44, lineHeight: 48, letterSpacing: -1 },
  heroUnit: { fontFamily: "Archivo_500", fontSize: 13 },
  chartBox: { marginTop: 20, alignSelf: "center", width: W },
  daysRow: { flexDirection: "row", marginTop: 8 },
  dayLbl: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 0.5 },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});
