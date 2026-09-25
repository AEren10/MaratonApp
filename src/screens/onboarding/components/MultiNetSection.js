import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { StatBlock } from "../../../components/design/StatBlock";
import { TargetNetField } from "./TargetNetField";
import {
  TYT_NET_MIN,
  TYT_NET_MAX,
  AYT_NET_MIN,
  AYT_NET_MAX,
} from "../useGoalSetupForm";

export function MultiNetSection({
  tytNet,
  setTytNet,
  aytNet,
  setAytNet,
  totalNet,
  secondLabel,
}) {
  const C = useC();

  return (
    <>
      <View style={styles.totalWrap}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>TOPLAM HEDEF</Text>
        <StatBlock
          value={totalNet}
          unit={`net · TYT: ${tytNet} + ${secondLabel}: ${aytNet}`}
          size="large"
        />
      </View>

      <TargetNetField
        title="TYT Hedef Net"
        value={tytNet}
        onChange={setTytNet}
        netLabel="TYT"
        min={TYT_NET_MIN}
        max={TYT_NET_MAX}
        size="count"
      />

      <TargetNetField
        title={`${secondLabel} Hedef Net`}
        value={aytNet}
        onChange={setAytNet}
        netLabel={secondLabel}
        min={AYT_NET_MIN}
        max={AYT_NET_MAX}
        size="count"
      />
    </>
  );
}

const styles = StyleSheet.create({
  totalWrap: { marginTop: STEP.s3, paddingVertical: STEP.s2 },
});
