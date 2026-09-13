import { Text } from "react-native";
import { Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// "Tahmin Şaştı" · NEREDE ŞAŞTIM. Yalniz son uc deneme gercekten yukseliyorsa
// cizilir (cumle ancak o zaman dogru). Tasarimdaki "Bu sonucu modele
// işledim." satiri CIZILMIYOR: sinav sonucu tahmin modeline girmiyor.
export function ForecastMissReasonCard() {
  const C = useC();
  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NEREDE ŞAŞTIM</Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text, marginTop: STEP.s2 }]}>
        Son üç denemende yükseliş vardı, tahminim onlara dayanıyordu. Sınav günü performansı denemelerden farklı olabiliyor.
      </Text>
    </Card>
  );
}
