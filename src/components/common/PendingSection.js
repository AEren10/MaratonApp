import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { SHAPE, STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";

// Veri gelmeden once bir bolumun DURUST hali.
//
// Alternatifi uydurma sayi gostermekti ve bir sure oyle yapildi: yeni acilan
// bir hesap "24 deneme kaydi", "Fen 5,50" goruyordu. Bos ekran kullaniciyi
// uzer, uydurma veri kandirir — ikincisi cok daha pahali.
//
// Kalip Rota ekranindan geliyor: deger yerine tire, altinda neyin acacagi.
// Kullanici ne oldugunu anlar, ne yapacagini bilir, yanlis bilgi almaz.
export function PendingSection({ label, title, note, hint }) {
  const C = useC();

  return (
    <View style={s.wrap}>
      {label ? (
        <Text style={[TYPOGRAPHY.label, s.label, { color: C.text2 }]}>{label}</Text>
      ) : null}

      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={s.row}>
          <View style={[s.dash, { backgroundColor: C.text5 }]} />
          {title ? (
            <Text style={[TYPOGRAPHY.bodyMedium, s.title, { color: C.text3 }]} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
        </View>

        {note ? (
          <Text style={[TYPOGRAPHY.captionMedium, s.note, { color: C.text2 }]}>{note}</Text>
        ) : null}

        {hint ? (
          <Text style={[TYPOGRAPHY.micro, s.hint, { color: C.text3 }]}>{hint}</Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginTop: STEP.s3 },
  label: { marginBottom: STEP.s2 },
  card: { borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  dash: { width: 26, height: 2, borderRadius: 1 },
  title: { flex: 1 },
  note: { marginTop: STEP.s2 },
  hint: { marginTop: STEP.s1 },
});
