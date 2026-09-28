import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { HeroTrendChartSvg } from "./HeroTrendChartSvg";
import { HeroMultiTrendChartSvg } from "./HeroMultiTrendChartSvg";
import { PendingSection } from "../../../components/common/PendingSection";

function formatNumber(n) {
  if (n == null || isNaN(n)) return "0,00";
  return Number(n).toFixed(2).replace(".", ",");
}

function formatDelta(n) {
  if (n == null || isNaN(n)) return "0,0";
  const abs = Math.abs(n).toFixed(1).replace(".", ",");
  return n > 0 ? `+${abs}` : n < 0 ? `-${abs}` : "0,0";
}

export function AnalysisHeroScore({ C, latest, heroLine = [], heroLabels = [], heroSeries = [] }) {
  // Burada net, trend, tarih ve grafigin TAMAMI icin uydurma yedek vardi:
  // deneme girmemis biri "58,25 · +2,3 · 23 HAZIRAN 2026" goruyordu.
  if (latest?.net == null) {
    return (
      <PendingSection
        label="NET ORTALAMASI"
        title="İlk denemeni bekliyorum"
        note="Deneme girdikçe net eğrin burada oluşur."
      />
    );
  }

  const data = heroLine.length >= 2 ? heroLine : [latest.net];
  const netText = formatNumber(latest.net);
  const trendVal = latest.trend ?? 0;
  const isUp = trendVal >= 0;
  const deltaColor = isUp ? C.up : C.down;
  const label = [latest.typeLabel, latest.date && String(latest.date).toUpperCase()]
    .filter(Boolean).join(" · ");
  // "Tumu"de iki tur de varsa TYT kirmizi, AYT krem cizgiyle birlikte cizilir.
  const multiSeries = heroSeries.map((line) => ({ ...line, color: line.key === "AYT" ? C.text : C.accent }));
  const multi = multiSeries.length > 1;
  const labels = heroLabels.length >= 3
    ? [heroLabels[0], heroLabels[Math.floor(heroLabels.length / 2)], heroLabels[heroLabels.length - 1]]
    : heroLabels;

  return (
    <View style={s.wrap}>
      <Text style={[s.headerLabel, { color: C.text2 }]}>{label}</Text>

      <View style={s.scoreRow}>
        <Text style={[s.bigScore, { color: C.text }]}>{netText}</Text>
        <View style={s.deltaBadge}>
          <Icon name={isUp ? "trendUp" : "trendDown"} size={14} color={deltaColor} sw={1.5} />
          <Text style={[s.deltaText, { color: deltaColor }]}>{formatDelta(trendVal).replace("+", "")}</Text>
        </View>
      </View>

      {multi ? (
        <View style={s.legend}>
          {multiSeries.map((line) => (
            <View key={line.key} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: line.color }]} />
              <Text style={[s.legendText, { color: C.text2 }]}>{line.key}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={s.chartContainer}>
        {multi
          ? <HeroMultiTrendChartSvg C={C} series={multiSeries} />
          : <HeroTrendChartSvg C={C} data={data} labels={labels} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: 30 },
  headerLabel: {
    paddingHorizontal: GUTTER,
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 1.84,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginTop: 8,
    paddingHorizontal: GUTTER,
  },
  bigScore: {
    fontFamily: "Bricolage_400",
    fontSize: 76,
    lineHeight: 76,
    letterSpacing: -2.5,
    fontVariant: ["tabular-nums"],
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 10,
  },
  deltaText: {
    fontFamily: "Archivo_600",
    fontSize: 15,
  },
  legend: { flexDirection: "row", gap: 16, marginTop: 12, paddingHorizontal: GUTTER },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Archivo_600", fontSize: 12 },
  chartContainer: {
    marginTop: 10,
    width: "100%",
    aspectRatio: 390 / 170,
  },
});