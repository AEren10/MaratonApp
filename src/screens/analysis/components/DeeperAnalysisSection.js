import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, STEP } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";

export function DeeperAnalysisSection({ C, onYanlisDefteri, onKonuIlerlemesi, onOncelikliKonular, onNetTahmini, onYayinKarsilastirmasi, onSimulasyon }) {
  const items = [
    {
      name: "Yanlış defteri",
      note: "Kaydettiğin yanlışlar ve tekrarı gelenler",
      onPress: onYanlisDefteri,
    },
    {
      name: "Konu İlerlemesi",
      note: "Konu konu çalışma ve defter durumu",
      onPress: onKonuIlerlemesi,
    },
    {
      name: "Zayıf dersler",
      note: "Son denemelerde ortalaması düşük dersler",
      onPress: onOncelikliKonular,
    },
    {
      name: "Net Tahmini",
      note: "Bu tempoyla sınav gününde nereye varırsın",
      onPress: onNetTahmini,
    },
    {
      // Bu satir ComparativeScreen'e gider: donem karsilastirmasi (bu donem
      // vs onceki, en iyi netler, tutarlilik). Yayin karsilastirmasi degil;
      // o, Analiz'in kendi kartinda.
      name: "Dönem karşılaştırması",
      note: "Bu dönem öncekine göre nasıl, en iyi netlerin, tutarlılık",
      onPress: onYayinKarsilastirmasi,
    },
    {
      name: "Simülasyon",
      note: "Tam süreli TYT provası",
      onPress: onSimulasyon,
    },
  ];

  return (
    <View style={s.wrap}>
      <Text style={[s.sectionLabel, { color: C.text2 }]}>DAHA DERİNE</Text>

      <View style={s.list}>
        {items.map((item) => (
          <Press haptic="none"
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={item.onPress}
            style={[s.row, { borderTopColor: C.line }]}
          >
            <View style={s.rowContent}>
              <Text style={[s.itemName, { color: C.text }]}>{item.name}</Text>
              <Text style={[s.itemNote, { color: C.text3 }]}>{item.note}</Text>
            </View>
            <Icon name="chevR" size={15} color={C.text4} />
          </Press>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s4,
  },
  sectionLabel: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 1.84,
    paddingBottom: STEP.s1,
  },
  list: {
    marginTop: STEP.s1 / 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s3 - 3,
    borderTopWidth: 1,
  },
  rowContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: "Bricolage_400",
    fontSize: 16.5,
  },
  itemNote: {
    fontFamily: "Archivo_400",
    fontSize: 12,
    marginTop: STEP.s1 / 2,
  },
});