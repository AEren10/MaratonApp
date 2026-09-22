import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { EMPTY_COPY } from "../../../constants/stateCopy";
import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const GHOST = [
  { width: "62%", opacity: 0.55 },
  { width: "88%", opacity: 0.35 },
  { width: "40%", opacity: 0.2 },
];

// "Boş Durumlar" artboardinin defter karti: kesik kenarli, hayalet satirlar.
export function NotebookEmpty({ onAdd }) {
  const C = useC();
  const copy = EMPTY_COPY.wrongNotebook;
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.outer}>
      <View style={[styles.card, { borderColor: C.border }]}>
        <View style={styles.ghosts}>
          {GHOST.map((g) => (
            <View key={g.width} style={[styles.ghost, { width: g.width, opacity: g.opacity, backgroundColor: C.text5 }]} />
          ))}
        </View>
        <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>{copy.title}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>{copy.body}</Text>
        <Button size="lg" fullWidth onPress={onAdd} style={{ marginTop: STEP.s3 }}>
          {copy.primary}
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    paddingHorizontal: GUTTER,
    justifyContent: "center",
    paddingBottom: STEP.s5 + STEP.s2,
  },
  card: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: SHAPE.sheet,
    padding: GUTTER,
  },
  ghosts: { gap: STEP.s1 },
  ghost: { height: 11, borderRadius: 2 },
  title: { marginTop: STEP.s3 },
});
