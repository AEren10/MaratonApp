import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../../components/design";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function TopicDebtImpactCard({ C, totalHours }) {
  return (
    <Card tone="surface" radius="panel" style={s.card}>
      <Text style={[TYPOGRAPHY.tableHead, s.kicker, { color: C.accentBright }]}>
        BU DURAKLARI KAPATINCA
      </Text>

      <View style={s.heroRow}>
        <Text style={[s.heroNumber, { color: C.up }]}>
          {totalHours} sa
        </Text>
        <Text style={[TYPOGRAPHY.meta, s.heroText, { color: C.text2 }]}>
          çalışma yükü kapanır · rotan daha dengeli hale gelir
        </Text>
      </View>

      <Text style={[TYPOGRAPHY.caption, s.bodyText, { color: C.text3 }]}>
        Düzenli tekrar ve soru çözümü, sonraki denemelerde daha iyi bir sonuç için zemin oluşturur.
      </Text>

      <View style={s.chipRow}>
        <View style={[s.chip, { backgroundColor: C.brandTint, borderColor: C.border }]}>
          <Text style={[s.chipText, { color: C.accentBright }]}>
            Çalışma yükü %18 azaldı
          </Text>
        </View>
        <View style={[s.chip, { backgroundColor: "transparent", borderColor: C.elev }]}>
          <Text style={[s.chipText, { color: C.text2 }]}>
            Rota yeniden dengeleniyor
          </Text>
        </View>
      </View>

      <Text style={[TYPOGRAPHY.micro, s.disclaimer, { color: C.text4 }]}>
        Rota tamamlanmadı ama yön doğru · uygulama içi rota göstergeleri, net tahmini değildir
      </Text>
    </Card>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: STEP.s4,
    padding: STEP.s3,
  },
  kicker: {
    marginBottom: STEP.s2,
    letterSpacing: 1.6,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s2,
    marginBottom: STEP.s3,
  },
  heroNumber: {
    fontFamily: "Bricolage_400",
    fontSize: 32,
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
  },
  heroText: {
    flex: 1,
    lineHeight: 18,
  },
  bodyText: {
    lineHeight: 20,
    marginBottom: STEP.s3,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: STEP.s1,
    marginBottom: STEP.s3,
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    textAlign: "center",
  },
  disclaimer: {
    lineHeight: 16,
  },
});
