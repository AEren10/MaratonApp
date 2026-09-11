import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";
import { EMPTY_COPY } from "../../../constants/stateCopy";

function RouteNetChart({ forecast, targetNet, C }) {
  const chartData = useMemo(() => {
    if (!forecast?.dataPoints?.length) return null;
    const stops = forecast.dataPoints.map((p) => ({ y: p.net }));
    const projection = Number.isFinite(forecast.projected) ? [forecast.projected] : [];
    const band = forecast.range
      ? { upper: [forecast.range.high], lower: [forecast.range.low] }
      : null;
    return { stops, todayIndex: stops.length - 1, projection, band };
  }, [forecast]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, { color: C.muted }]}>NET ORTALAMASI</Text>
      {chartData ? (
        <>
          <RouteLineChart
            stops={chartData.stops}
            todayIndex={chartData.todayIndex}
            projection={chartData.projection}
            band={chartData.band}
            target={Number.isFinite(targetNet) ? targetNet : undefined}
            height={200}
          />
          {Number.isFinite(forecast.projected) ? (
            <Text style={[styles.caption, { color: C.sec }]}>
              Bu tempoyla sınav günü {"≈"} {Math.round(forecast.projected)} net
              {forecast.range ? ` · tahmin aralığı ${Math.round(forecast.range.low)}–${Math.round(forecast.range.high)}` : ""}
            </Text>
          ) : null}
        </>
      ) : (
        <View style={[styles.empty, { borderColor: C.border, backgroundColor: C.elev }]}>
          <Icon name="trendUp" size={18} color={C.muted} />
          <View style={styles.emptyCopy}>
            <Text style={[styles.emptyTitle, { color: C.text }]}>{EMPTY_COPY.analysisThin.title}</Text>
            <Text style={[styles.emptyBody, { color: C.sec }]}>{EMPTY_COPY.analysisThin.body}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default memo(RouteNetChart);

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.lg },
  eyebrow: { ...TYPOGRAPHY.label, marginBottom: SPACING.sm },
  caption: { ...TYPOGRAPHY.caption, marginTop: SPACING.sm },
  empty: {
    borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md,
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
  },
  emptyCopy: { flex: 1 },
  emptyTitle: { ...TYPOGRAPHY.captionMedium },
  emptyBody: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
});
