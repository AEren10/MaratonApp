import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { STEP } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

// Tek deneme girildiginde (n=1) grafik alaninda gosterilen dürüst durum.
// Kaynak: design/analiz-algoritma-briefi.md §1.9 ve stateCopy.js analysisThin.
export function AnalysisHeroChartEmpty({ C }) {
  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={s.badgeRow}>
          <View style={[s.dot, { backgroundColor: C.accent }]} />
          <Text style={[s.badgeText, { color: C.text3 }]}>2. DENEMEDE AÇILACAK</Text>
        </View>

        <View style={s.contentRow}>
          <View style={[s.iconBox, { backgroundColor: C.elev }]}>
            <Icon name="trendUp" size={16} color={C.text3} />
          </View>
          <View style={s.textBox}>
            <Text style={[s.title, { color: C.text }]}>Bir denemeyle rota çizilir, eğilim çizilmez</Text>
            <Text style={[s.note, { color: C.text2 }]}>
              İkinci denemeni girdiğinde yön açılır; üçüncüden sonra tahmin bandı çizilir.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: STEP.s3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: STEP.s2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontFamily: "Archivo_600",
    fontSize: 13.5,
    lineHeight: 18,
  },
  note: {
    fontFamily: "Archivo_400",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
});
