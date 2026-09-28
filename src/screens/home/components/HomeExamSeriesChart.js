import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CHART_H } from "../../../components/charts/chartStyle";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HeroMultiTrendChartSvg } from "../../analysis/components/HeroMultiTrendChartSvg";

// Ana sayfa grafiginin ucuncu sayfasi: TYT ve AYT ayri cizgi (Analiz'deki
// "Tumu" grafigiyle ayni renkler: TYT kirmizi, AYT krem). Netler toplanmaz.
export const HomeExamSeriesChart = React.memo(function HomeExamSeriesChart({ series }) {
  const C = useC();
  const lines = series.map((line) => ({ ...line, color: line.key === "AYT" ? C.text : C.accent }));
  return (
    <View>
      <View style={s.legend}>
        {lines.map((line) => (
          <View key={line.key} style={s.legendItem}>
            <View style={[s.swatch, { backgroundColor: line.color }]} />
            <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{line.key}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: CHART_H - STEP.s3 }}>
        <HeroMultiTrendChartSvg C={C} series={lines} />
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  legend: { flexDirection: "row", gap: STEP.s2, height: STEP.s3, alignItems: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: STEP.s1 / 2 },
  swatch: { width: STEP.s2, height: 3, borderRadius: 2 },
});
