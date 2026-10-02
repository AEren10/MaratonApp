import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Line, Circle, Path } from "react-native-svg";
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
    { label: "Pzt", questions: 30, minutes: 45 },
    { label: "Sal", questions: 50, minutes: 75 },
    { label: "Çar", questions: 0, minutes: 0 },
    { label: "Per", questions: 85, minutes: 120 },
    { label: "Cum", questions: 40, minutes: 60 },
    { label: "Cmt", questions: 110, minutes: 160 },
    { label: "Paz", questions: 70, minutes: 90 },
  ];

  const maxVal = Math.max(...rawDays.map((d) => d.minutes || d.questions || 0), 60);
  const barAreaH = H - BARS_PAD_BOTTOM;
  const slotW = W / rawDays.length;
  const barW = Math.min(26, slotW * 0.58);
  const goalY = barAreaH * 0.35;

  return (
    <View style={s.wrap}>
      {/* Baslik & Hafta Toplami */}
      <View style={s.head}>
        <Text style={[s.eyebrow, { color: p.accent }, p.shadow]}>HAFTALIK ÇALIŞMA</Text>
        <View style={s.metricRow}>
          {showQuestions && data.weekQuestions ? (
            <View style={s.statBox}>
              <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{data.weekQuestions}</Text>
              <Text style={[s.heroUnit, { color: p.mid }, p.shadow]}>soru / hafta</Text>
            </View>
          ) : null}
          {showMinutes && data.weekMinutes ? (
            <View style={s.statBox}>
              <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{fmtMinutes(data.weekMinutes)}</Text>
              <Text style={[s.heroUnit, { color: p.mid }, p.shadow]}>toplam süre</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 7 Gunluk Cubuk Grafigi */}
      <View style={s.chartBox}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Hedef cizgisi ve minik bayrak */}
          {showGoalLine ? (
            <>
              <Line x1={0} y1={goalY} x2={W - 24} y2={goalY} stroke="rgba(255,255,255,0.22)" strokeWidth={1} strokeDasharray="4 4" />
              <Path d={`M${W - 22},${goalY - 14} L${W - 8},${goalY - 7} L${W - 22},${goalY} Z`} fill={p.accent} />
              <Line x1={W - 22} y1={goalY - 14} x2={W - 22} y2={goalY + 4} stroke={p.accent} strokeWidth={1.5} />
            </>
          ) : null}

          {/* Gunlerin cubuklari */}
          {rawDays.map((d, i) => {
            const val = d.minutes || d.questions || 0;
            const h = val > 0 ? Math.max(14, (val / maxVal) * (barAreaH - 24)) : 4;
            const x = i * slotW + (slotW - barW) / 2;
            const y = barAreaH - h;
            const isToday = i === (data.todayIndex ?? 6);

            return (
              <Rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={4}
                fill={isToday ? p.accent : val > 0 ? p.solid : "rgba(255,255,255,0.12)"}
                fillOpacity={val > 0 ? 0.95 : 0.3}
              />
            );
          })}
        </Svg>

        {/* Gun etiketleri ve sureler */}
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
  chartBox: { marginTop: 24, alignSelf: "center", width: W },
  daysRow: { flexDirection: "row", marginTop: 8 },
  dayLbl: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 0.5 },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});
