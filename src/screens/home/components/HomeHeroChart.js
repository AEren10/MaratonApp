import { View, Text, StyleSheet } from "react-native";
import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { CHART_H } from "../../../components/charts/chartStyle";

// Ucretsizde rota grafigi kilitli: sakin bir onizleme ve kilit ikonu.
// Veri yoksa (henuz 3 denemeden az) sakin bir bos durum gosterilir.
// Yukseklik ORTAK tuvalden gelir: haftalik grafik de ayni degeri kullaniyor.
// Elle yazilan 200 ile haftalik grafigin oranindan cikan yukseklik tutmuyordu.
export function HomeHeroChart({ hasAccess, data, declared, declaredAxis, target, height = CHART_H }) {
  const C = useC();

  if (!hasAccess) {
    return (
      <View style={[s.fallback, { height, borderColor: C.border, backgroundColor: C.surface }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ROTA ÖNİZLEMESİ</Text>
        <Icon name="lock" size={20} color={C.text3} style={{ marginTop: STEP.s1 }} />
        <Text style={[TYPOGRAPHY.body, s.copy, { color: C.text2, marginTop: STEP.s1 }]}>
          Denemelerin geldikçe rota çizgin burada açılır.
        </Text>
      </View>
    );
  }

  // Olculmus hat yoksa bos kutu gostermeyiz: kullanici kurulumda baslangic
  // ve hedef netini zaten verdi, iki ucu o sayilarla yazariz.
  if (!data) {
    if (declared) return <RouteEmptyChart declared={declared} axisLabels={declaredAxis} height={height} />;
    return (
      <View style={[s.fallback, { height, borderColor: C.border, backgroundColor: C.surface }]}>
        <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>
          Rota grafiğin için en az iki deneme gerekiyor
        </Text>
      </View>
    );
  }

  return (
    <RouteLineChart
      stops={data.stops}
      todayIndex={data.todayIndex}
      projection={data.projection}
      band={data.band}
      todayLabel={data.todayLabel}
      endLabel={data.endLabel}
      axisLabels={data.axisLabels}
      target={target}
      height={height}
    />
  );
}

const s = StyleSheet.create({
  fallback: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  copy: { maxWidth: 240, textAlign: "center" },
});
