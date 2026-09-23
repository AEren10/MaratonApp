import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { EMPTY_COPY } from "../../../../constants/stateCopy";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { StreakZeroHero } from "./StreakZeroHero";

const COPY = EMPTY_COPY.streakZero;

export function StreakZeroEmpty({ onPrimary, onSecondary }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <StreakZeroHero />
      <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>
        {COPY.title}
      </Text>
      <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>
        {COPY.body}
      </Text>
      <View style={styles.actions}>
        <Button size="lg" fullWidth onPress={onPrimary}>
          {COPY.primary}
        </Button>
        <Pressable
          onPress={onSecondary}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Text style={[TYPOGRAPHY.button, { color: C.accentBright }]}>
            {COPY.secondary}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center" },
  title: { marginTop: STEP.s2, textAlign: "center" },
  body: { marginTop: STEP.s1, textAlign: "center" },
  actions: { width: "100%", marginTop: STEP.s4, gap: STEP.s1 },
  secondary: { minHeight: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
