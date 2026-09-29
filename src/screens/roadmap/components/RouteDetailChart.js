import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { useC } from "../../../contexts/ThemeContext";
import { makeScale, netTicks } from "../../../lib/routeChartPath";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { CHART_H, CHART_W, scaleOptions } from "../../../components/charts/chartStyle";

import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";

// RouteLineChart'in tuval olcusu ve olcek kurali (tek ortak olcek).
// Etiketler RouteLineChart'in KENDI olcegiyle (scaleOptions) konumlanir;
// ayri pad/yukseklik yazilinca BUGUN ve HEDEF dugumden birkac px kayiyordu.
const W = CHART_W;
const TAG_W = 96;

// Rota Detay grafigi: paylasilan RouteLineChart + tasarimin etiketleri
// (NET, HEDEF, BUGUN, SINAV GUNU · N, sinav tarihi). Etiket konumu grafigin
// kendi olceginden hesaplanir; tuval genislige oturtulur ki ikisi ortussun.
export function RouteDetailChart({ chart, target, examDateTag }) {
  const C = useC();
  const [width, setWidth] = useState(0);
  const H = CHART_H;
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
    // Bolunmus eksen (netChartData.routeXs) grafikle ayni olcekten.
    const sc = makeScale(allValues, { ...scaleOptions({ hasAxis: false }), xs: chart?.xs || null });
    const last = Math.max(0, values.length - 1);
    const [todayPoint] = sc.toPoints([values[last]], { count: total, offset: last });
    const endValue = projection.length ? projection[projection.length - 1] : null;
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const tickVals = netTicks(minVal, maxVal);
    const ticks = tickVals.map((v) => ({ val: v, y: sc.toY(v) }));

    return {
      today: { x: todayPoint?.x ?? W / 2, y: todayPoint?.y ?? H / 2 },
      end: endValue != null ? { y: sc.toY(endValue) } : null,
      targetY: hasTarget ? sc.toY(target) : null,
      ticks,
    };
  }, [stops, projection, hasTarget, target, H, chart?.xs]);

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
          xs={chart?.xs}
          mode={chart?.mode}
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
            <Text style={[...tag, s.targetTag, { top: pos.targetY * k - STEP.s3, color: C.targetLabel }]}>
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
            {chart?.projectedNet != null ? `SINAV GÜNÜ · ${chart.projectedNet}` : chart?.mode === "target" ? "" : "TAHMİN YOK"}
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
  // Sagda hedef bayragi duruyor; etiket cizginin sol basinda (tasarim).
  targetTag: { left: 30 },
  center: { width: TAG_W, textAlign: "center" },
  bottom: { bottom: 0 },
});
