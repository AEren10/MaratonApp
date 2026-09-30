import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Zeminde düz metin: kart/kutu yok. Chip çerçeveleri kaldırıldı.
export function TopicDebtImpactCard({ C, totalHours, stopCount = 0, weekShare = null }) {
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, s.kicker, { color: C.accentBright }]}>
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

      <View style={s.metaRow}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>
          {`${stopCount} konu kapanır`}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}> · </Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>
          {weekShare != null ? `Haftanın %${weekShare}'i kadar iş` : "Rota yeniden dengelenir"}
        </Text>
      </View>

      <Text style={[TYPOGRAPHY.micro, s.disclaimer, { color: C.text3 }]}>
        Rota tamamlanmadı ama yön doğru · uygulama içi rota göstergeleri, net tahmini değildir
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  kicker: { marginBottom: STEP.s2, letterSpacing: 1.6 },
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
  heroText: { flex: 1, lineHeight: 18 },
  bodyText: { lineHeight: 20, marginBottom: STEP.s2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: STEP.s2 },
  disclaimer: { lineHeight: 16 },
});
