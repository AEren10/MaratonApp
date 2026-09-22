import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import {
  Easing, useReducedMotion, useSharedValue, withTiming,
} from "react-native-reanimated";

import { EffortDay } from "./components/EffortDay";
import { EffortSlotDefs } from "./components/EffortSlot";
import { useC } from "../../contexts/ThemeContext";
import {
  CHART_W, CHART_H, PAD_LEFT, PAD_RIGHT, PAD_TOP, LABEL, plotBottom,
} from "./chartStyle";

const BAR_RADIUS = 3;
// Tasarimin izin verdigi hareket suresi (0.5-0.9 sn) icinde, alt siniri.
const GROW_MS = 620;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Haftanin emek grafigi: 7 gun, 7 cubuk, yuksekligi o gun cozulen soru.
// Ustte kesikli gunluk hedef cizgisi. Rota grafigiyle AYNI tuval olcusunu
// kullanir (chartStyle) — ikisi slider'da yan yana duruyor, birbirinden
// farkli boyda olurlarsa kaydirirken zipliyorlar.
export function WeeklyEffortChart({ week, todayIndex, height = CHART_H }) {
  const C = useC();
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  // Haftanin degerleri degistiginde (gun doner, kayit girilir) yeniden kurulur.
  const signature = (week?.days || []).map((d) => d.questions).join(",");
  useEffect(() => {
    if (reduced) { progress.value = 1; return; }
    progress.value = 0;
    progress.value = withTiming(1, { duration: GROW_MS, easing: EASE_OUT });
  }, [signature, progress, reduced]);

  if (!week) return null;

  const bottom = plotBottom({ hasAxis: true });
  const top = PAD_TOP;
  const usableH = bottom - top;
  const usableW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const slot = usableW / week.days.length;
  const barW = Math.min(26, slot * 0.52);

  // Tuval tepe payı (headroom): Hedef çizgisi tavana yapışmasın;
  // hedefte veya 300 soru gibi yüksek sayılarda çubuklar taşmadan
  // orantılı ve ferah kalsın.
  const peak = (week.days || []).reduce((max, d) => Math.max(max, d.questions), 0);
  const goal = week.goal || 0;
  const chartMax = Math.max(
    Math.round(peak * 1.2),
    Math.round(goal * 1.55),
    100
  );

  const yOf = (value) => bottom - (value / chartMax) * usableH;
  const goalY = goal > 0 ? yOf(goal) : null;

  return (
    <View
      style={[s.wrap, { height }]}
      accessible
      accessibilityLabel={week.summary || "Bu hafta henüz çalışma kaydın yok."}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <EffortSlotDefs color={C.accent} />
        <Line
          x1={PAD_LEFT} y1={bottom} x2={CHART_W - PAD_RIGHT} y2={bottom}
          stroke={C.line} strokeWidth={1}
        />

        {week.days.map((day, i) => {
          const cx = PAD_LEFT + slot * i + slot / 2;
          return (
            <EffortDay
              key={day.label}
              day={day}
              index={i}
              todayIndex={todayIndex}
              goal={week.goal}
              x={cx - barW / 2}
              width={barW}
              bottom={bottom}
              goalY={goalY}
              yOf={yOf}
              radius={BAR_RADIUS}
              progress={progress}
              C={C}
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
  // Yukseklik SABIT, oran degil. Rota grafigi de sabit yukseklik kullaniyor;
  // biri orana biri piksele baglandiginda ikisi ekran genisligine gore farkli
  // boya oturuyor ve slider'da sayfa degisirken alt taraf zipliyordu.
  wrap: { width: "100%" },
});
