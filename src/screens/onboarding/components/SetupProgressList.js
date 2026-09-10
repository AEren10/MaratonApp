import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: "KURULUM n/4" ilerleme cetveli + adim listesi (label="Kurulum Yarim").
export function SetupProgressList({ steps, nextStepKey }) {
  const C = useC();
  return (
    <View>
      {steps.map((step) => {
        const isCurrent = step.key === nextStepKey;
        return (
          <View key={step.key} style={[styles.row, { borderTopColor: C.line }]}>
            <View
              style={[
                styles.box,
                step.done
                  ? { backgroundColor: C.accent, borderColor: C.accent }
                  : { borderWidth: 1.8, borderColor: isCurrent ? C.accent : C.track },
              ]}
            >
              {step.done ? <Icon name="check" size={10} color={C.accentInk} sw={1.7} /> : null}
            </View>
            <Text
              style={[
                TYPOGRAPHY.bodyMedium,
                { flex: 1, color: step.done || isCurrent ? C.text : C.text3 },
              ]}
            >
              {step.label}
            </Text>
            {step.summary ? (
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{step.summary}</Text>
            ) : null}
            {!step.done && isCurrent ? (
              <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>SIRADAKİ</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderTopWidth: 1 },
  box: { width: 20, height: 20, borderRadius: 4, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
