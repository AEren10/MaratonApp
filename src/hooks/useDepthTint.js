import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

// Ekranin ust isigina ders rengi ver. Ders bilgisi navigasyon parametresiyle
// gelmeyen ekranlar (durak detayi, deneme detayi) veriyi yukledikten sonra
// cagirir; DepthLayout `route.params.tint`i okur.
export function useDepthTint(subjectKey) {
  const navigation = useNavigation();
  const route = useRoute();
  const current = route.params?.tint ?? null;
  const next = subjectKey || null;
  useEffect(() => {
    if (next !== current) navigation.setParams({ tint: next });
  }, [navigation, next, current]);
}
