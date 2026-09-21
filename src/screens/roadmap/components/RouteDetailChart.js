import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { useC } from "../../../contexts/ThemeContext";
import { makeScale } from "../../../lib/routeChartPath";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";

// RouteLineChart'in tuval olcusu ve olcek kurali (tek ortak olcek).
const W = 390;
const H = 250;
const PAD = 20;
const TAG_W = 96;

function makeTicks(min, max, count = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return [];
  const span = max - min;
  const rawStep = span / (count - 1);
  const step = rawStep > 15 ? 20 : rawStep > 7 ? 10 : 5;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 0.1 && ticks.length < count + 1; v += step) {
    ticks.push(v);
  }
  return ticks.length >= 2 ? ticks : [Math.round(min), Math.round((min + max) / 2), Math.round(max)];
}

// Rota Detay grafigi: paylasilan RouteLineChart + tasarimin etiketleri
// (NET, HEDEF, BUGUN, SINAV GUNU · N, sinav tarihi). Etiket konumu grafigin
// kendi olceginden hesaplanir; tuval genislige oturtulur ki ikisi ortussun.
export function RouteDetailChart({ chart, target, examDateTag }) {
  const C = useC();
  const [width, setWidth] = useState(0);
  const k = width / W;
  const hasTarget = Number.isFinite(target);

  const stops = chart?.stops || [];
  const projection = chart?.projection || [];

  const pos = useMemo(() => {
    if (!stops.length) {
      return { today: { x: W / 2, y: H / 2 }, end: null, targetY: null, ticks: [] };
    }
    const values = stops.map((p) => (typeof p === "number" ? p : p?.y ?? 0));
    const allValues = [...values, ...projection, ...(hasTarget ? [target] : [])];
    const total = values.length + projection.length;
    const sc = makeScale(allValues, {
      width: W, height: H, padTop: PAD, padBottom: PAD,
    });
    const stepX = total > 1 ? W / (total - 1) : 0;
    const last = Math.max(0, values.length - 1);
    const endValue = projection.length ? projection[projection.length - 1] : null;
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const tickVals = makeTicks(minVal, maxVal);
    const ticks = tickVals.map((v) => ({ val: v, y: sc.toY(v) }));

    return {
      today: { x: total > 1 ? last * stepX : W / 2, y: sc.toY(values[last]) ?? H / 2 },
      end: endValue != null ? { y: sc.toY(endValue) } : null,
      targetY: hasTarget ? sc.toY(target) : null,
      ticks,
    };
  }, [stops, projection, hasTarget, target]);

  if (!stops.length) {
    return <RouteEmptyChart examDateTag={examDateTag} target={target} />;
  }

  const tag = [TYPOGRAPHY.tableHead, s.tag];
  return (
    <View style={s.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <RouteLineChart
          stops={stops}
          todayIndex={chart?.todayIndex}
          projection={projection}
          band={chart?.band}
          target={hasTarget ? target : undefined}
          ticks={pos.ticks}
          height={H * k}
        />
      ) : <View style={{ aspectRatio: W / H }} />}
      {width > 0 ? (
        <>
          <Text style={[...tag, s.net, { color: C.text3 }]}>NET</Text>
          {pos.ticks.map((t) => (
            <Text
              key={`ax-${t.val}`}
              style={[s.axisLabel, { top: t.y * k - 7, color: C.text4 }]}
            >
              {t.val}
            </Text>
          ))}
          {pos.targetY != null ? (
            <Text style={[...tag, s.right, { top: pos.targetY * k - STEP.s3, color: C.targetLabel }]}>
              HEDEF {Math.round(target)}
            </Text>
          ) : null}
          <Text
            style={[...tag, s.center, {
              left: Math.min(width - TAG_W, Math.max(0, pos.today.x * k - TAG_W / 2)),
              top: pos.today.y * k + STEP.s2, color: C.accentBright,
            }]}
          >
            BUGÜN
          </Text>
          <Text
            style={[...tag, s.right, {
              top: (pos.end ? pos.end.y * k : H * k / 2) + STEP.s2, color: C.text2,
            }]}
          >
            {chart?.projectedNet != null ? `SINAV GÜNÜ · ${chart.projectedNet}` : "TAHMİN YOK"}
          </Text>
          {examDateTag ? (
            <Text style={[...tag, s.right, s.bottom, { color: C.text3 }]}>{examDateTag}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "relative", paddingBottom: STEP.s3 },
  tag: { position: "absolute" },
  net: { left: STEP.s1, top: 0 },
  axisLabel: {
    position: "absolute",
    left: 4,
    width: 22,
    textAlign: "right",
    fontFamily: "Archivo_500",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  right: { right: STEP.s1 },
  center: { width: TAG_W, textAlign: "center" },
  bottom: { bottom: 0 },
});
