import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { CHART_H, CHART_W } from "../../../components/charts/chartStyle";
import { useRouteChartPos } from "./useRouteChartPos";
import { RouteDotBeacon } from "./RouteDotBeacon";
import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";

// Rota Detay grafigi: RouteLineChart + etiketler (NET, HEDEF, BUGUN, SINAV GUNU).
const W = CHART_W;
const TAG_W = 96;
const DATE_W = 40;
const DRAW_MS = 1600;

export function RouteDetailChart({ chart, target, examDateTag, onSelectStop, selectedIndex }) {
  const C = useC();
  const [width, setWidth] = useState(0);
  const H = CHART_H;
  const k = width / W;
  const hasTarget = Number.isFinite(target);

  const stops = chart?.stops || [];
  const projection = chart?.projection || [];

  const pos = useRouteChartPos({
    stops,
    projection,
    hasTarget,
    target,
    xs: chart?.xs,
  });

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
          drawMs={DRAW_MS}
        />
      ) : <View style={{ aspectRatio: W / H }} />}
      {width > 0 ? (
        <>
          {selectedIndex != null && pos.points[selectedIndex] ? (
            <View
              pointerEvents="none"
              style={[
                s.selectRing,
                {
                  left: pos.points[selectedIndex].x * k - 14,
                  top: pos.points[selectedIndex].y * k - 14,
                  borderColor: C.accentBright,
                  backgroundColor: C.brandTint,
                },
              ]}
            />
          ) : null}

          {/* Dokunulabilir oldugunu soyleyen halkalar (secim yokken). */}
          {onSelectStop && selectedIndex == null ? pos.points.map((p, i) => (
            <RouteDotBeacon key={`beacon-${i}`} x={p.x * k} y={p.y * k} color={C.accentBright} index={i} />
          )) : null}

          {pos.points.map((p, i) => (
            <Pressable
              key={`pt-touch-${i}`}
              onPress={() => onSelectStop?.(stops[i], i)}
              hitSlop={8}
              style={[s.touchNode, { left: p.x * k - 22, top: p.y * k - 22 }]}
              accessibilityRole="button"
              accessibilityLabel={`${stops[i]?.trial?.name || stops[i]?.label || "Deneme"}, net ${stops[i]?.y}`}
            />
          ))}

          {pos.points.map((p, i) => (
            <Pressable
              key={`d-${i}`}
              onPress={() => onSelectStop?.(stops[i], i)}
              hitSlop={4}
              style={[
                s.datePress,
                { left: Math.min(width - DATE_W, Math.max(0, p.x * k - DATE_W / 2)), top: H * k + 2 },
              ]}
            >
              <Text
                style={[
                  TYPOGRAPHY.micro,
                  s.date,
                  { color: selectedIndex === i ? C.accentBright : C.text3 },
                ]}
              >
                {stops[i]?.label || ""}
              </Text>
            </Pressable>
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
  wrap: { position: "relative", paddingBottom: STEP.s3 + STEP.s2 },
  datePress: { position: "absolute", width: DATE_W, alignItems: "center" },
  date: { textAlign: "center", fontVariant: ["tabular-nums"] },
  touchNode: { position: "absolute", width: 44, height: 44, borderRadius: 22, zIndex: 10 },
  selectRing: { position: "absolute", width: 28, height: 28, borderRadius: 14, borderWidth: 2, zIndex: 5 },
  tag: { position: "absolute" },
  right: { right: STEP.s1 },
  targetTag: { left: 30 },
  center: { width: TAG_W, textAlign: "center" },
  bottom: { bottom: 0 },
});
