import { View, Text, StyleSheet } from "react-native";

import { Card, StatBlock } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

// Rota etkisi — yalnizca gercek rota verisi varsa gosterilir (sabit deger yok).
export function SummaryRouteImpact({ impact }) {
  const C = useC();
  if (!impact) return null;

  return (
    <View style={styles.wrap}>
      <Card tone="surface">
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ROTAYA ETKİSİ</Text>

        <View style={styles.progressRow}>
          <StatBlock size="value" value={`${impact.progressPct}%`} label="ROTA İLERLEMESİ" color={C.up} />
        </View>

        <View style={[styles.track, { backgroundColor: C.track }]}>
          <View style={[styles.fill, { width: `${impact.progressPct}%`, backgroundColor: C.up }]} />
        </View>

        {impact.remainingQuestions != null ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s2 }]}>
            Kalan {impact.remainingQuestions} soru
          </Text>
        ) : null}

        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s2 }]}>
          Rota etkisi uygulamanın kendi ilerleme göstergesidir · net tahmini değildir
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  progressRow: { marginTop: STEP.s2 },
  track: { height: 4, borderRadius: 2, marginTop: STEP.s3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});
