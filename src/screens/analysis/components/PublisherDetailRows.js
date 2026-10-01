import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, STEP, TYPOGRAPHY, SHAPE } from "../../../themes/tokens";

export function PublisherDetailRows({ C, publishers = [] }) {
  return (
    <View style={s.listSection}>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text2, marginBottom: STEP.s2 }]}>YAYIN SIRALAMASI</Text>
      {publishers.map((p, idx) => (
        <View key={p.name} style={[s.pubRow, { borderBottomColor: C.line, borderBottomWidth: idx === publishers.length - 1 ? 0 : 1 }]}>
          <View style={s.pubInfo}>
            <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>{p.name}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{p.trials} deneme</Text>
          </View>
          <View style={s.barSection}>
            <View style={[s.barTrack, { backgroundColor: C.track }]}>
              <View style={[s.barFill, { width: p.percent, backgroundColor: C.accent }]} />
            </View>
          </View>
          <Text style={[s.netVal, { color: C.text }]}>{String(p.net).replace(".", ",")}</Text>
        </View>
      ))}
    </View>
  );
}

export function PublisherInsightBlock({ C }) {
  return (
    <View style={[s.insightBlock, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text, fontFamily: "Archivo_600" }]}>
        Yayın Zorluk Katsayısı
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>
        Zor yayınlarda yaşanan net kayıpları motivasyonunu düşürmesin. Maraton rota motoru, deneme zorluk katsayısını hesaba katarak çalışma yükünü dengeler.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  listSection: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s4,
  },
  pubRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2 + 2,
    gap: STEP.s2,
  },
  pubInfo: {
    width: 90,
  },
  barSection: {
    flex: 1,
  },
  barTrack: {
    height: 8,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  netVal: {
    width: 48,
    textAlign: "right",
    fontFamily: "Bricolage_400",
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  insightBlock: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s4,
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
});
