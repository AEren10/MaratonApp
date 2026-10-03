import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, STEP } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useExam } from "../../../contexts/ExamContext";

// Yanlis defteri burada da vardi; grafigin altindaki satir tek giris.
export function DeeperAnalysisSection({
  C,
  onKonuIlerlemesi,
  onOncelikliKonular,
  onSenaryolar,
  onNetTahmini,
  onYayinKarsilastirmasi,
  onSimulasyon,
}) {
  // Simulasyon YKS (TYT) provasi; LGS ogrencisine gosterilmez.
  const { examType } = useExam();
  const isLGS = String(examType || "").toLowerCase() === "lgs";
  const items = [
    {
      name: "Senaryolar",
      note: "Aynı hedef, 3 farklı haftalık tempo yükü",
      onPress: onSenaryolar,
    },
    {
      name: "Net & Sıralama Tahmini",
      note: "Hedef açığı, net bandı ve tahmini sıralama simülasyonu",
      onPress: onNetTahmini,
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
      // Bu satir ComparativeScreen'e gider: donem karsilastirmasi (bu donem
      // vs onceki, en iyi netler, tutarlilik). Yayin karsilastirmasi degil;
      // o, Analiz'in kendi kartinda.
      name: "Dönem karşılaştırması",
      note: "Bu dönem öncekine göre nasıl, en iyi netlerin, tutarlılık",
      onPress: onYayinKarsilastirmasi,
    },
    isLGS ? null : {
      name: "Simülasyon",
      note: "Tam süreli TYT provası",
      onPress: onSimulasyon,
    },
  ].filter(Boolean);

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