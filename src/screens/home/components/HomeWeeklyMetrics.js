import { StyleSheet, Text, View } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes } from "../../../domain/home/weeklyEffort";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useCountUp } from "../../../hooks/useCountUp";

// Haftalik cubuk grafigi altinda toplam sure. Soru sayisi kalkti: grafik zaten
// soruyu gosteriyor (kullanici karari, 29 Eylul).
export function HomeWeeklyMetrics({ weeklyEffort }) {
  const C = useC();
  const totalMinutes = weeklyEffort?.totalMinutes || 0;

  // Toplam dakika sayilir: dakikalar hizli akar, saat yavasca artar.
  const durationStr = formatMinutes(useCountUp(totalMinutes));

  return (
    <View style={s.row}>
      <View style={s.colLeft}>
        <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]} numberOfLines={1}>
          {durationStr}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          bu hafta çalıştın
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: STEP.s2,
    minHeight: STEP.s5,
  },
  colLeft: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
