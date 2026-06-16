import { Text } from "react-native";
import { TYPOGRAPHY } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

// Editöryal bölüm başlığı — uppercase, harf aralıklı, nötr muted.
// Ekranlara ritim/gruplama verir (kart enflasyonunu kırar).
export function SectionLabel({ children, style }) {
  const C = useC();
  return (
    <Text style={[{ ...TYPOGRAPHY.label, color: C.muted, marginBottom: 8 }, style]}>
      {children}
    </Text>
  );
}
