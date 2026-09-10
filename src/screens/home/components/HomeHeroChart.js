import { View, Text, StyleSheet } from "react-native";
import { RouteLineChart } from "../../../components/charts/RouteLineChart";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Ucretsizde rota grafigi kilitli: "ROTA · PRO" etiketi + kilit ikonu.
// Veri yoksa (henuz 3 denemeden az) sakin bir bos durum gosterilir.
export function HomeHeroChart({ hasAccess, data, target, height = 200 }) {
  const C = useC();

  if (!hasAccess) {
    return (
      <View style={[s.fallback, { height, borderColor: C.border, backgroundColor: C.surface }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ROTA · PRO</Text>
        <Icon name="lock" size={20} color={C.text3} style={{ marginTop: STEP.s1 }} />
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>Rotanı gör</Text>
      </View>
    );
  }

  if (!data) {
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
});
