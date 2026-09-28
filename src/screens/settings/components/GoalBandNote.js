import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: hedef netin bolum bandiyla iliskisini soyleyen tint kutu.
// Sadece gercek veri varken (hedef bolum + esik sonucu) gosteriliyor —
// uydurma "haftalik yuk X duraktan Y'ye cikar" sayisi YOK, cunku rota
// motorunda bu simulasyonu ureten bir kaynak yok.
// Acik SON DENEMEYE gore ve tek sinavin hedefiyle hesaplaniyor (TYT ise TYT);
// cumle hangi sinav oldugunu soyler. Eskiden TYT+AYT toplamini yazip TYT
// acigini soyluyordu ("130 net bandin icinde" yalniz TYT tutmusken).
export function GoalBandNote({ examLabel, targetDepartment, gapResult }) {
  const C = useC();
  if (!targetDepartment || !gapResult) return null;

  const exam = examLabel ? `${examLabel} ` : "";
  const text = gapResult.reached
    ? `Son ${exam}denemen ${targetDepartment} hedefine yetiyor.`
    : `${targetDepartment} hedefine ${exam}${gapResult.gap} net kaldı.`;

  return (
    <View style={[styles.box, { backgroundColor: C.brandTint, borderColor: C.accent }]}>
      <Text style={[TYPOGRAPHY.caption, { color: C.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: STEP.s3, padding: STEP.s2 + STEP.s1,
    borderRadius: SHAPE.panel, borderWidth: 1,
  },
});
