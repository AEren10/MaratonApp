import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { TRIAL_DIFFICULTY_LEVELS } from "../trialDifficultyLevels";
import { TrialEntryChip } from "./TrialEntryChip";
import { TrialEntryRuleLabel } from "./TrialEntryRuleLabel";
import { Press } from "../../../components/design/Press";

function Level({ level, active, onPress }) {
  const C = useC();
  return (
    <Press haptic="none" onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: active }}
      accessibilityLabel={`${level.label} ${level.factor}`}
      style={[styles.level, {
        backgroundColor: active ? C.brandTint : "transparent",
        borderColor: active ? C.accent : C.border,
      }]}>
      <Text numberOfLines={1} style={[TYPOGRAPHY.meta, {
        fontFamily: active ? "Archivo_600" : "Archivo_500", color: active ? C.text : C.text2,
      }]}>{level.label}</Text>
      <Text style={[TYPOGRAPHY.micro, styles.factor, { color: active ? C.accentBright : C.text3 }]}>
        {level.factor}
      </Text>
    </Press>
  );
}

// YAYIN cipleri + SENCE NE KADAR ZORDU 2x2 izgarasi.
export function TrialNormalizationFields({
  difficultyLevel, onDifficultyChange, onPublisherChange, publisherId, publishers, enterDelay = 70,
}) {
  const C = useC();
  const pickPublisher = (id) => { H.select(); onPublisherChange(publisherId === id ? null : id); };
  const pickLevel = (key) => { H.select(); onDifficultyChange(key); };
  const rows = [TRIAL_DIFFICULTY_LEVELS.slice(0, 2), TRIAL_DIFFICULTY_LEVELS.slice(2)];
  return (
    <>
      {publishers.length ? (
        <Animated.View style={styles.section}>
          <TrialEntryRuleLabel>YAYIN</TrialEntryRuleLabel>
          <View style={styles.chips}>
            {publishers.map((publisher) => (
              <TrialEntryChip key={publisher.id} label={publisher.name}
                active={publisherId === publisher.id} onPress={() => pickPublisher(publisher.id)} />
            ))}
          </View>
        </Animated.View>
      ) : null}
      <Animated.View style={styles.section}>
        <TrialEntryRuleLabel>SENCE NE KADAR ZORDU</TrialEntryRuleLabel>
        {rows.map((row, index) => (
          <View key={index} style={[styles.grid, index > 0 && { marginTop: STEP.s1 }]}>
            {row.map((level) => (
              <Level key={level.key} level={level} active={difficultyLevel === level.key}
                onPress={() => pickLevel(level.key)} />
            ))}
          </View>
        ))}
        <Text style={[TYPOGRAPHY.micro, styles.note, { color: C.text3 }]}>
          Ölçü ÖSYM'nin kendi denemesi. Emin değilsen "ÖSYM ayarında" bırak.
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: STEP.s3 + 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
  grid: { flexDirection: "row", gap: STEP.s1 },
  level: {
    flex: 1, minWidth: 0, height: 66, borderRadius: SHAPE.button, borderWidth: 1,
    alignItems: "center", justifyContent: "center", gap: 5,
  },
  factor: { fontFamily: "Archivo_600", fontVariant: ["tabular-nums"] },
  note: { fontFamily: "Archivo_400", marginTop: STEP.s2 - 1 },
});
