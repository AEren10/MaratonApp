import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";

export function SubjectProgressBanner({ C, onAddToRoute, solvedCount = "1.284" }) {
  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.topRow}>
          <Text style={[s.tag, { color: C.text2 }]}>ÇALIŞMA VERİLERİNDEN</Text>
          <Text style={[s.count, { color: C.text3 }]}>{solvedCount} soru</Text>
        </View>

        <Text style={[s.title, { color: C.text }]}>
          Altı konuda defter yükü veya çalışma açığı var.
        </Text>

        <Text style={[s.desc, { color: C.text3 }]}>
          Sıralama çalışma geçmişin, defterde bekleyen sorular ve rota gecikmesine göre. Denemelerden yalnızca ders neti alınır.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="İlk üçüne durak koy"
          onPress={onAddToRoute}
          style={({ pressed }) => [
            s.btn,
            { borderColor: C.border, backgroundColor: pressed ? C.elev : "transparent" },
          ]}
        >
          <Text style={[s.btnText, { color: C.text }]}>İlk üçüne durak koy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  card: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  topRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  tag: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.84 },
  count: { fontFamily: "Archivo_500", fontSize: 11.5, fontVariant: ["tabular-nums"] },
  title: { fontFamily: "Bricolage_400", fontSize: 19, lineHeight: 25, marginTop: STEP.s2 },
  desc: { fontFamily: "Archivo_400", fontSize: 13, lineHeight: 19, marginTop: STEP.s1 },
  btn: {
    width: "100%",
    height: 44,
    marginTop: STEP.s2,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontFamily: "Archivo_600", fontSize: 13 },
});