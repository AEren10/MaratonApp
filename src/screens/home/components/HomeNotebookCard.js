import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// "Defter" karti.
//
// IKI HALI VAR, CUNKU IKI AYRI SEY SOYLUYOR:
//
// Tekrar bekleyen yoksa — sakin bir giris. Sayi UYDURULMAZ.
//
// Tekrar bekleyen varsa — bugunun ikinci isi. Aralikli tekrar bu uygulamanin
// net kazandiran tek mekanizmasi ve eskiden tamamen sessizdi: sorular
// birikiyor, ogrenci Deftere kendi girmedikce haberi olmuyordu. Kart o zaman
// duraklarin hemen altina cikiyor ve dokunuldugunda listeye degil, DOGRUDAN
// tekrar oturumuna gidiyor -- arada bir ekran daha olsa kimse gecmez.
export function HomeNotebookCard({ dueCount = 0, onPress, onReview }) {
  const C = useC();
  const due = dueCount > 0;
  const action = due ? onReview || onPress : onPress;

  return (
    <Press
      onPress={() => action?.()}
      accessibilityLabel={due ? `${dueCount} soru tekrar bekliyor, tekrar oturumunu başlat` : "Defter"}
      style={[
        s.card,
        {
          backgroundColor: C.surface,
          borderColor: due ? alpha(C.accent, 38) : C.border,
        },
      ]}
    >
      <Icon name="notebook" size={20} color={due ? C.accent : alpha(C.accent, 55)} />
      <View style={s.flex}>
        <Text style={[TYPOGRAPHY.bodyMedium, s.title, { color: C.text }]}>
          {due ? `${dueCount} soru tekrar bekliyor` : "Defter"}
        </Text>
        {due ? (
          <Text style={[TYPOGRAPHY.meta, s.sub, { color: C.text3 }]}>
            Hafızadan silinmeden önce bir kez daha gör.
          </Text>
        ) : null}
      </View>
      <Icon name="chevR" size={12} color={due ? C.text3 : C.text5} />
    </Press>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, padding: STEP.s3 - 2,
    borderRadius: SHAPE.card, borderWidth: 1,
  },
  flex: { flex: 1, minWidth: 0 },
  title: { fontSize: TYPOGRAPHY.bodyMedium.fontSize + 0.5 },
  sub: { marginTop: STEP.s1 / 2 },
});
