import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GoalNetStepper } from "./GoalNetStepper";

export function GoalMultiNetSection({
  value,
  tytValue,
  secondLabel,
  aytValue,
  decTyt,
  incTyt,
  decAyt,
  incAyt,
  aytMin,
  aytMax,
}) {
  const C = useC();

  return (
    <>
      <View style={styles.totalBadge}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>
          {`TOPLAM: ${value} NET (TYT: ${tytValue} + ${secondLabel}: ${aytValue})`}
        </Text>
      </View>

      <Text style={[TYPOGRAPHY.label, styles.section, { color: C.text2 }]}>
        TYT HEDEF NETİ
      </Text>
      <GoalNetStepper
        value={tytValue}
        min={20}
        max={120}
        netLabel="TYT"
        label="TYT hedef netini"
        onDec={decTyt}
        onInc={incTyt}
      />

      <Text style={[TYPOGRAPHY.label, styles.section, { color: C.text2 }]}>
        {`${secondLabel} HEDEF NETİ`}
      </Text>
      <GoalNetStepper
        value={aytValue}
        min={aytMin}
        max={aytMax}
        netLabel={secondLabel}
        label={`${secondLabel} hedef netini`}
        onDec={decAyt}
        onInc={incAyt}
      />
    </>
  );
}

const styles = StyleSheet.create({
  totalBadge: { marginTop: STEP.s3, marginBottom: STEP.s1 },
  section:    { marginTop: STEP.s4, marginBottom: STEP.s1 },
});
