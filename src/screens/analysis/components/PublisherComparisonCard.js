import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, SHAPE } from "../../../themes/tokens";

export function PublisherComparisonCard({ C }) {
  const publishers = [
    { name: "Limit", net: 58, percent: "88%" },
    { name: "3D", net: 52, percent: "79%" },
    { name: "Karekök", net: 47, percent: "71%" },
  ];

  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[s.cardTitle, { color: C.accentBright }]}>YAYIN KARŞILAŞTIRMASI</Text>

        <View style={s.list}>
          {publishers.map((p) => (
            <View key={p.name} style={s.row}>
              <Text style={[s.pubName, { color: C.text2 }]}>{p.name}</Text>
              <View style={[s.track, { backgroundColor: C.track }]}>
                <View style={[s.bar, { width: p.percent, backgroundColor: C.accent }]} />
              </View>
              <Text style={[s.netNum, { color: C.text }]}>{p.net}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.footnote, { color: C.text2 }]}>
          Zor yayınlarda net düşüşün normal — panik yapma. Rota normalize net üzerinden çizilir.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: 26,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 2.07, // .18em
    textTransform: "uppercase",
  },
  list: {
    gap: 12,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pubName: {
    width: 74,
    fontFamily: "Archivo_500",
    fontSize: 12.5,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 1,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 1,
  },
  netNum: {
    width: 34,
    textAlign: "right",
    fontFamily: "Bricolage_400",
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  footnote: {
    fontFamily: "Archivo_400",
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: 16,
  },
});