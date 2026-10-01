import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { StatsStrip } from "../../../components/design/StatsStrip";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const RATE_MAP = (C) => ({
  improving: { label: "Yükseliş trendi", icon: "trendUp", color: C.up },
  declining: { label: "Düşüş trendi", icon: "trendDown", color: C.down },
  stable: { label: "Dengeli performans", icon: "minus", color: C.text3 },
});

export function PeriodSummary({ current, previous, diff, improvementRate, consistency }) {
  const C = useC();
  const rateMap = RATE_MAP(C);
  const rate = rateMap[improvementRate] ?? rateMap.stable;
  const isPositive = diff.avgNet >= 0;
  const sign = isPositive ? "+" : "";

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>DÖNEM KARŞILAŞTIRMASI</Text>

      <View style={s.heroRow}>
        <Text style={[TYPOGRAPHY.statLarge, s.num, { color: C.text }]}>
          {current.avgNet.toFixed(1).replace(".", ",")}
        </Text>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text3, marginLeft: STEP.s1, marginBottom: 6 }]}>
          net
        </Text>
      </View>

      <View style={s.trendRow}>
        <Icon name={rate.icon} size={15} color={rate.color} />
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: rate.color }]}>
          {rate.label}
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
          (önceki döneme göre {sign}{diff.avgNet.toFixed(1).replace(".", ",")} net)
        </Text>
      </View>

      <StatsStrip
        C={C}
        cells={[
          { label: "Önceki", value: previous.avgNet.toFixed(1).replace(".", ",") },
          { label: "Değişim", value: `${sign}${diff.avgNet.toFixed(1).replace(".", ",")}` },
          { label: "Tutarlılık", value: `${Math.round(consistency?.score ?? 0)}/100` },
          { label: "Deneme", value: String(current.count) },
        ]}
        style={{ marginTop: STEP.s3 }}
      />

      <View style={s.metaFooter}>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          Bu dönem {current.count} deneme · Önceki dönem {previous.count} deneme
        </Text>
        {consistency?.label ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
            Tutarlılık durumu: {consistency.label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s2,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: STEP.s1,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    marginTop: STEP.s1 / 2,
    flexWrap: "wrap",
  },
  metaFooter: {
    marginTop: STEP.s2,
    gap: 2,
  },
});
