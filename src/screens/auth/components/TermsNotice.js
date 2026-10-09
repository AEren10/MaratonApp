import { Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Giris ekrani: kutu yok, butona basmak onaydir. Apple ilk giriste hesap
// acabildigi icin sartlar butonun hemen altinda bilgi olarak durur.
export function TermsNotice({ onOpenTerms, onOpenPrivacy }) {
  const C = useC();
  const link = { color: C.text2, textDecorationLine: "underline" };
  return (
    <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>
      {"Apple ile devam ederek "}
      <Text onPress={onOpenTerms} accessibilityRole="link" style={link}>Kullanım Şartları</Text>
      {"'nı ve "}
      <Text onPress={onOpenPrivacy} accessibilityRole="link" style={link}>Gizlilik Politikası</Text>
      {"'nı kabul etmiş olursun."}
    </Text>
  );
}
