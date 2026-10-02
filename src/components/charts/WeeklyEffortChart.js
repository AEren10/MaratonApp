import { Fragment, memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";

import { EffortDay } from "./components/EffortDay";
import { EffortSlotDefs } from "./components/EffortSlot";
import { EffortGrid } from "./components/EffortGrid";
import { RouteTargetFlag } from "./components/RouteTargetFlag";
import { compactDuration, effortLabelLayout } from "./components/effortLabels";
import { useC } from "../../contexts/ThemeContext";
import { useChartFrame } from "./useChartFrame";
import {
  CHART_H, EFFORT_PAD_LEFT, PAD_RIGHT, PAD_TOP, LABEL, plotBottom,
} from "./chartStyle";

const BAR_RADIUS = 3;

// Haftanin emek grafigi: 7 gun, 7 cubuk, yuksekligi o gunun CALISMA SURESI
// (soru girilmemis calisma da dolar). Soru sayisi cubugun icinde kucuk sayi.
export const WeeklyEffortChart = memo(function WeeklyEffortChart({ week, todayIndex, height = CHART_H }) {
  const C = useC();
  const { onLayout, vbW, wide } = useChartFrame(height);

  if (!week) return null;

  // Bos hafta da 7 bos kutuyla gorunur (kullanici karari, 28 Eylul): cubuklar
  // her zaman yerinde, gun calisildikca dolar. Bos kart cubuklarin yerini
  // aliyor ve ustteki sayilarin uzerine biniyordu.
  const bottom = plotBottom({ hasAxis: true });
  const top = PAD_TOP;
  const usableH = bottom - top;
  const usableW = vbW - EFFORT_PAD_LEFT - PAD_RIGHT;
  const slot = usableW / week.days.length;
  // Ince cubuk (kullanici istegi, 29 Eylul): 34/0.68 -> 24/0.5.
  const barW = Math.min(24, slot * 0.5);

  const peak = week.peakMinutes || 0;
  const goal = week.minutesGoal || 0;
  const chartMax = Math.max(Math.round(peak * 1.15), Math.round(goal * 1.22), 60);

  const yOf = (value) => bottom - (value / chartMax) * usableH;
  const goalY = goal > 0 ? yOf(goal) : null;
  const { labelYOf } = effortLabelLayout({ week, todayIndex, goalY, top, slot, width: vbW });

  return (
    <View
      style={[s.wrap, { height }, wide]}
      onLayout={onLayout}
      accessible
      accessibilityLabel={week.summary || "Bu hafta henüz çalışma kaydın yok."}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${vbW} ${CHART_H}`}>
        <EffortSlotDefs color={C.line} />

        <EffortGrid chartMax={chartMax} yOf={yOf} width={vbW} C={C} />

        <Line
          x1={EFFORT_PAD_LEFT} y1={bottom} x2={vbW - PAD_RIGHT} y2={bottom}
          stroke={C.line} strokeWidth={1}
        />

        {week.days.map((day, i) => {
          const cx = EFFORT_PAD_LEFT + slot * i + slot / 2;
          const barTop = day.minutes > 0 ? yOf(day.minutes) : bottom - 6;
          // Soru sayisi cubugun DIBINDE: ustteki sure etiketiyle cakismaz.
          const showQ = day.questions > 0 && bottom - barTop >= 20;
          return (
            <Fragment key={day.label}>
            {day.minutes > 0 ? (
              <SvgText
                x={cx} y={labelYOf(i, barTop)}
                fill={C.text2} fontSize={11} fontWeight="600" textAnchor="middle"
              >
                {compactDuration(day.minutes)}
              </SvgText>
            ) : null}
            <EffortDay
              day={day}
              index={i}
              todayIndex={todayIndex}
              goal={goal}
              x={cx - barW / 2}
              width={barW}
              bottom={bottom}
              goalY={goalY}
              yOf={yOf}
              radius={BAR_RADIUS}
              C={C}
            />
            {showQ ? (
              <SvgText x={cx} y={bottom - 6} fill={C.accentInk} fillOpacity={0.92} fontSize={11} fontWeight="600" textAnchor="middle">
                {day.questions}
              </SvgText>
            ) : null}
            </Fragment>
          );
        })}

        {goalY != null ? (
          <>
            <Line
              x1={EFFORT_PAD_LEFT} y1={goalY} x2={vbW - PAD_RIGHT} y2={goalY}
              stroke={C.targetLine} strokeWidth={1.5} strokeDasharray="4 6"
            />
            {/* Hedef yazisi yerine rota grafigindeki bayrak: cizginin sag ucunda. */}
            <RouteTargetFlag x={vbW - PAD_RIGHT} y={goalY} C={C} />
          </>
        ) : null}

        {week.days.map((day, i) => {
          const cx = EFFORT_PAD_LEFT + slot * i + slot / 2;
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
