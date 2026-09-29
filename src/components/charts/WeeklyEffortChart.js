import { Fragment, memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";

import { EffortDay } from "./components/EffortDay";
import { EffortSlotDefs } from "./components/EffortSlot";
import { useC } from "../../contexts/ThemeContext";
import {
  CHART_W, CHART_H, EFFORT_PAD_LEFT, PAD_RIGHT, PAD_TOP, LABEL, plotBottom, gridSteps,
} from "./chartStyle";

const BAR_RADIUS = 3;

// Cubugun ustundeki sure etiketi: dar alana sigsin diye "2s 15d" bicimi.
function compactDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}d`;
  return m > 0 ? `${h}s ${m}d` : `${h}s`;
}

// Haftanin emek grafigi: 7 gun, 7 cubuk, yuksekligi o gun cozulen soru.
export const WeeklyEffortChart = memo(function WeeklyEffortChart({ week, todayIndex, height = CHART_H }) {
  const C = useC();

  if (!week) return null;

  // Bos hafta da 7 bos kutuyla gorunur (kullanici karari, 28 Eylul): cubuklar
  // her zaman yerinde, gun calisildikca dolar. Bos kart cubuklarin yerini
  // aliyor ve ustteki sayilarin uzerine biniyordu.

  const bottom = plotBottom({ hasAxis: true });
  const top = PAD_TOP;
  const usableH = bottom - top;
  const usableW = CHART_W - EFFORT_PAD_LEFT - PAD_RIGHT;
  const slot = usableW / week.days.length;
  // Ince cubuk (kullanici istegi, 29 Eylul): 34/0.68 -> 24/0.5.
  const barW = Math.min(24, slot * 0.5);

  const peak = (week.days || []).reduce((max, d) => Math.max(max, d.questions), 0);
  const goal = week.goal || 0;
  const chartMax = Math.max(Math.round(peak * 1.15), Math.round(goal * 1.22), 10);

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

        {/* Sol eksen: olcek. Izgara cizgileri cubuklarin ARKASINDA kalir,
            hayalet kutularin kenarligiyla yarismasin diye opaklik dusuk.
            Etiket rengi text4 -- tokens.js'e gore yalniz eksen/izgara
            etiketinde kullanilan ton. */}
        {gridSteps(chartMax).map((v) => {
          const gy = yOf(v);
          return (
            <Fragment key={`grid-${v}`}>
              <Line
                x1={EFFORT_PAD_LEFT} y1={gy} x2={CHART_W - PAD_RIGHT} y2={gy}
                stroke={C.line} strokeWidth={1} strokeOpacity={0.55}
              />
              <SvgText
                x={EFFORT_PAD_LEFT - 6} y={gy + 3.5}
                fill={C.text4} fontSize={11} textAnchor="end"
              >
                {v}
              </SvgText>
            </Fragment>
          );
        })}

        <Line
          x1={EFFORT_PAD_LEFT} y1={bottom} x2={CHART_W - PAD_RIGHT} y2={bottom}
          stroke={C.line} strokeWidth={1}
        />

        {week.days.map((day, i) => {
          const cx = EFFORT_PAD_LEFT + slot * i + slot / 2;
          const barTop = day.questions > 0 ? yOf(day.questions) : bottom - 6;
          return (
            <Fragment key={day.label}>
            {day.minutes > 0 ? (
              <SvgText
                x={cx} y={Math.max(top + 9, barTop - 5)}
                fill={C.text2} fontSize={11} fontWeight="600" textAnchor="middle"
              >
                {compactDuration(day.minutes)}
              </SvgText>
            ) : null}
            <EffortDay
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
            </Fragment>
          );
        })}

        {goalY != null ? (
          <>
            <Line
              x1={EFFORT_PAD_LEFT} y1={goalY} x2={CHART_W - PAD_RIGHT} y2={goalY}
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
