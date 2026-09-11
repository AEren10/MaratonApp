import { View, Text } from "react-native";
import { SectionLabel } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";

function CredentialRow({ label, value, unit, last }) {
  const C = useC();
  return (
    <View style={{
      flexDirection: "row", alignItems: "baseline", gap: STEP.s2,
      paddingVertical: STEP.s2 + 2,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line,
    }}>
      <Text style={{ flex: 1, fontFamily: "Archivo_500", fontSize: 13.5, color: C.text2 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Bricolage_400", fontSize: 26, color: C.text, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.text3, width: 34 }}>
        {unit}
      </Text>
    </View>
  );
}

// Tasarim adi: "YOL KÜNYESİ". Placeholder sayisi tasarimda 3 — kariyer
// toplamlariyla (soru/saat/en uzun seri) birebir eslesiyor.
export function RouteCredentialsList({ totalQuestions, totalHours, longestStreak }) {
  const C = useC();
  const qDisplay = totalQuestions >= 1000
    ? totalQuestions.toLocaleString("tr-TR")
    : String(totalQuestions);

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 }}>
      <SectionLabel style={{ color: C.text2, marginBottom: STEP.s1 - 4 }}>YOL KÜNYESİ</SectionLabel>
      <CredentialRow label="Toplam çözülen soru" value={qDisplay} unit="soru" />
      <CredentialRow label="Toplam çalışma" value={String(totalHours)} unit="saat" />
      <CredentialRow label="En uzun seri" value={String(longestStreak || 0)} unit="gün" last />
    </View>
  );
}
