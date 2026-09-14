import { View, Text, StyleSheet } from "react-native";

import { Card } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";

// Ayin Ozeti · ayin ilk ve son denemesi arasindaki net hatti.
// Tasarimdaki bant/hedef cumlesi tahmin modelinden gelir; burada yalniz
// iki gercek deneme ve farki gosterilir.
export function NetSpanCard({ span }) {
  const C = useC();
  if (!span) return null;
  const up = span.delta > 0;
  return (
    <View style={styles.wrap}>
      <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
        <View style={styles.row}>
          <View>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{span.startLabel}</Text>
            <Text style={[TYPOGRAPHY.statCount, { color: C.text3 }]}>{span.startValue}</Text>
          </View>
          <View style={styles.link}>
            <View style={[styles.track, { backgroundColor: C.track }]} />
            <View style={[styles.node, { backgroundColor: C.accent }]} />
          </View>
          <View>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>{span.endLabel}</Text>
            <Text style={[TYPOGRAPHY.statCount, { color: C.text }]}>{span.endValue}</Text>
          </View>
          <View style={styles.delta}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: up ? C.up : C.down }]}>{span.deltaLabel}</Text>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>net</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2 },
  link: { flex: 1, height: 30, justifyContent: "center" },
  track: { height: 2 },
  node: { position: "absolute", right: 0, width: 8, height: 8, borderRadius: STEP.s1 / 2 },
  delta: { alignItems: "flex-end" },
});
