import { StyleSheet, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import {
  CHART_W, CHART_H, PAD_LEFT, PAD_RIGHT, PAD_TOP, LABEL, plotBottom,
} from "./chartStyle";

const BAR_RADIUS = 3;
// Soru girilmemis ama calisilmis gun: sifir degil, kisa bir iz.
const MINUTES_ONLY_H = 6;

// Haftanin emek grafigi: 7 gun, 7 cubuk, yuksekligi o gun cozulen soru.
// Ustte kesikli gunluk hedef cizgisi. Rota grafigiyle AYNI tuval olcusunu
// kullanir (chartStyle) — ikisi slider'da yan yana duruyor, birbirinden
// farkli boyda olurlarsa kaydirirken zipliyorlar.
export function WeeklyEffortChart({ week, todayIndex }) {
  const C = useC();
  if (!week) return null;

  const bottom = plotBottom({ hasAxis: true });
  const top = PAD_TOP;
  const usableH = bottom - top;
  const usableW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const slot = usableW / week.days.length;
  const barW = Math.min(26, slot * 0.52);

  const yOf = (value) => bottom - (value / week.maxValue) * usableH;
  const goalY = week.goal > 0 ? yOf(week.goal) : null;

  return (
    <View
      style={s.wrap}
      accessible
      accessibilityLabel={week.summary || "Bu hafta henüz çalışma kaydın yok."}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Line
          x1={PAD_LEFT} y1={bottom} x2={CHART_W - PAD_RIGHT} y2={bottom}
          stroke={C.line} strokeWidth={1}
        />

        {week.days.map((day, i) => {
          const cx = PAD_LEFT + slot * i + slot / 2;
          const x = cx - barW / 2;
          const isToday = i === todayIndex;

          let height = 0;
          let fill = C.track;
          if (day.questions > 0) {
            height = Math.max(4, bottom - yOf(day.questions));
            // Hedefi tutturan gun vurgulanir; tutturamayan gun de gorunur
            // kalir, cezalandirilmaz.
            fill = week.goal > 0 && day.questions >= week.goal ? C.up : C.accent;
          } else if (day.minutesOnly) {
            height = MINUTES_ONLY_H;
            fill = C.text5;
          }

          return (
            <Rect
              key={day.label}
              x={x}
              y={height > 0 ? bottom - height : bottom - 2}
              width={barW}
              height={height > 0 ? height : 2}
              rx={BAR_RADIUS}
              fill={height > 0 ? fill : C.track}
              fillOpacity={height > 0 ? (isToday ? 1 : 0.88) : 0.5}
            />
          );
        })}

        {goalY != null ? (
          <>
            <Line
              x1={PAD_LEFT} y1={goalY} x2={CHART_W - PAD_RIGHT} y2={goalY}
              stroke={C.targetLine} strokeWidth={1.5} strokeDasharray="4 6"
            />
            <SvgText
              x={CHART_W - PAD_RIGHT} y={goalY - 7}
              fill={C.text4} fontSize={LABEL.size} fontWeight="500" textAnchor="end"
            >
              {`GÜNLÜK HEDEF ${week.goal}`}
            </SvgText>
          </>
        ) : null}

        {week.days.map((day, i) => {
          const cx = PAD_LEFT + slot * i + slot / 2;
          const isToday = i === todayIndex;
          return (
            <SvgText
              key={`lbl-${day.label}`}
              x={cx} y={CHART_H - 6}
              fill={isToday ? C.accentBright : C.text4}
              fontSize={LABEL.size}
              fontWeight={isToday ? LABEL.weight : "500"}
              textAnchor="middle"
            >
              {day.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: CHART_W / CHART_H },
});
