import { StyleSheet, Text, View } from "react-native";

import { Card } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useRouteConfirm } from "../../hooks/useRouteConfirm";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RouteConfirmLayout } from "./components/RouteConfirmLayout";
import { RouteNumbersCard } from "./components/RouteNumbersCard";

// Tasarim AKIS 2 · "Rotayı Yeniden Çiz": yikici aksiyon ne degisip ne
// kaldigini sayiyla soyler. Giris: Rotanin tamami · "Rotayı yeniden çiz",
// Geri Donus hero'su · "Rotayı yeniden düzenle".
export default function RouteRedrawScreen() {
  const C = useC();
  const d = useRouteConfirm();
  const changes = [
    d.remainingStops > 0 ? `Kalan ${d.remainingStops} durağın sırası` : null,
    "Haftalık soru yükü ve tempo",
    "Tahmin bandı son 5 denemeden yeniden hesaplanır",
  ].filter(Boolean);

  return (
    <RouteConfirmLayout
      title="Rota sıfırdan çizilir."
      body="Kayıtların silinmez. Değişen tek şey durak sırası ve haftalık yük dağılımı."
      primaryLabel="Rotayı yeniden çiz"
      onPrimary={d.confirmRedraw}
      loading={d.redrawing}
      cancelLabel="Vazgeç"
      onCancel={d.goBack}
    >
      <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DEĞİŞİR</Text>
        <View style={s.list}>
          {changes.map((text) => (
            <View key={text} style={s.item}>
              <View style={[s.bullet, { backgroundColor: C.accent }]} />
              <Text style={[TYPOGRAPHY.caption, s.text, { color: C.text2 }]}>{text}</Text>
            </View>
          ))}
        </View>
      </Card>
      <RouteNumbersCard label="KALIR" loading={d.statsLoading} stats={d.keptStats} />
    </RouteConfirmLayout>
  );
}

const s = StyleSheet.create({
  list: { marginTop: STEP.s2, gap: STEP.s2 - 1 },
  item: { flexDirection: "row", gap: STEP.s2 - 1 },
  bullet: { width: 5, height: 5, borderRadius: SHAPE.chip / 6, marginTop: STEP.s1 - 1 },
  text: { flex: 1 },
});
