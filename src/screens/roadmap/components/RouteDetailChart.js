import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { useC } from "../../../contexts/ThemeContext";
import { makeScale } from "../../../lib/routeChartPath";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

import { RouteEmptyChart } from "./RouteEmptyChart";

// RouteLineChart'in tuval olcusu ve olcek kurali (tek ortak olcek).
const W = 390;
const H = 250;
const PAD = 20;
const TAG_W = 96;

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
      return { today: { x: W / 2, y: H / 2 }, end: null, targetY: null };
    }
    const values = stops.map((p) => (typeof p === "number" ? p : p?.y ?? 0));
    const total = values.length + projection.length;
    const sc = makeScale([...values, ...projection, ...(hasTarget ? [target] : [])], {
      width: W, height: H, padTop: PAD, padBottom: PAD,
    });
    const stepX = total > 1 ? W / (total - 1) : 0;
    const last = Math.max(0, values.length - 1);
    const endValue = projection.length ? projection[projection.length - 1] : null;
    return {
      today: { x: total > 1 ? last * stepX : W / 2, y: sc.toY(values[last]) ?? H / 2 },
      end: endValue != null ? { y: sc.toY(endValue) } : null,
      targetY: hasTarget ? sc.toY(target) : null,
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
          height={H * k}
        />
      ) : <View style={{ aspectRatio: W / H }} />}
      {width > 0 ? (
        <>
          <Text style={[...tag, s.net, { color: C.text3 }]}>NET</Text>
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
  right: { right: STEP.s1 },
  center: { width: TAG_W, textAlign: "center" },
  bottom: { bottom: 0 },
});
