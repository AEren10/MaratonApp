import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";

import { EffortDay } from "./components/EffortDay";
import { EffortSlotDefs } from "./components/EffortSlot";
import { useC } from "../../contexts/ThemeContext";
import {
  CHART_W, CHART_H, PAD_LEFT, PAD_RIGHT, PAD_TOP, LABEL, plotBottom,
} from "./chartStyle";

const BAR_RADIUS = 3;

// Haftanin emek grafigi: 7 gun, 7 cubuk, yuksekligi o gun cozulen soru.
// Ustte kesikli gunluk hedef cizgisi. Rota grafigiyle AYNI tuval olcusunu
// kullanir (chartStyle) — ikisi slider'da yan yana duruyor, birbirinden
// farkli boyda olurlarsa kaydirirken zipliyorlar.
export const WeeklyEffortChart = memo(function WeeklyEffortChart({ week, todayIndex, height = CHART_H }) {
  const C = useC();

  if (!week) return null;

  const bottom = plotBottom({ hasAxis: true });
  const top = PAD_TOP;
  const usableH = bottom - top;
  const usableW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const slot = usableW / week.days.length;
  // Cubuk genisligi: yuvanin yarisindan az oldugunda haftalik grafik yedi
  // ince cizgiye donuyor ve aradaki bosluk cubuktan genis kaliyor. Oran
  // 0.52 -> 0.68, tavan 26 -> 34: aralar hala nefes aliyor ama agirlik
  // cubukta.
  const barW = Math.min(34, slot * 0.68);

  // Tuval tepe payı (headroom): hedef çizgisi tavana yapışmasın ama
  // üstünde ÖLÜ ALAN da kalmasın.
  //
  // Eskiden goal * 1.55 idi: hedef 100 olan boş bir haftada ölçek 155'e
  // çıkıyor, hedef çizgisi tuvalin %64'ünde kalıyor ve üstündeki %36
  // tamamen boş duruyordu. Ana sayfanın en görünür yerinde ~60px ölü alan.
  // Sabit 100 tabanı da düşük hedefli kullanıcıda (günde 20 soru) aynı
  // boşluğu daha beter üretiyordu.
  //
  // 1.22: hedefi aşınca hâlâ yer var, aşmayınca boşluk göze batmıyor.
  const peak = (week.days || []).reduce((max, d) => Math.max(max, d.questions), 0);
  const goal = week.goal || 0;
  const chartMax = Math.max(
    Math.round(peak * 1.15),
    Math.round(goal * 1.22),
    10
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
        <EffortSlotDefs color={C.line} />
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
});

const s = StyleSheet.create({
  // Yukseklik SABIT, oran degil. Rota grafigi de sabit yukseklik kullaniyor;
  // biri orana biri piksele baglandiginda ikisi ekran genisligine gore farkli
  // boya oturuyor ve slider'da sayfa degisirken alt taraf zipliyordu.
  wrap: { width: "100%" },
});
