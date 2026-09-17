import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { HeroTrendChartSvg } from "./HeroTrendChartSvg";

function formatNumber(n) {
  if (n == null || isNaN(n)) return "0,00";
  return Number(n).toFixed(2).replace(".", ",");
}

function formatDelta(n) {
  if (n == null || isNaN(n)) return "0,0";
  const abs = Math.abs(n).toFixed(1).replace(".", ",");
  return n > 0 ? `+${abs}` : n < 0 ? `-${abs}` : "0,0";
}

export function AnalysisHeroScore({ C, latest, heroLine = [], heroLabels = [] }) {
  const data = useMemo(() => {
    if (heroLine.length >= 2) return heroLine;
    return [54, 56.5, 59, 56, 59.5, 55.5, 58.25];
  }, [heroLine]);

  const netText = latest?.net != null ? formatNumber(latest.net) : "58,25";
  const trendVal = latest?.trend ?? 2.3;
  const isUp = trendVal >= 0;
  const deltaColor = isUp ? C.up : C.down;
  const label = (latest?.typeLabel || "TYT DENEMESİ") + " · " + (latest?.date || "23 HAZİRAN 2026").toUpperCase();

  const labels = heroLabels.length >= 3
    ? [heroLabels[0], heroLabels[Math.floor(heroLabels.length / 2)], heroLabels[heroLabels.length - 1]]
    : ["22 HAZ", "5 TEM", "18 TEM"];

  return (
    <View style={s.wrap}>
      <Text style={[s.headerLabel, { color: C.text2 }]}>{label}</Text>

      <View style={s.scoreRow}>
        <Text style={[s.bigScore, { color: C.text }]}>{netText}</Text>
        <View style={s.deltaBadge}>
          <Icon name={isUp ? "trendUp" : "trendDown"} size={14} color={deltaColor} sw={2.2} />
          <Text style={[s.deltaText, { color: deltaColor }]}>{formatDelta(trendVal).replace("+", "")}</Text>
        </View>
      </View>

      <View style={s.chartContainer}>
        <HeroTrendChartSvg C={C} data={data} labels={labels} />
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
  chartContainer: {
    marginTop: 10,
    width: "100%",
    aspectRatio: 390 / 170,
  },
});