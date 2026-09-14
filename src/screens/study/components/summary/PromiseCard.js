import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import * as H from "../../../../lib/haptics";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

// Haftalik Ozet · "SÖZ VE GERÇEK" -> Plan vs Gercek
export function PromiseCard({ promise, onPress }) {
  const C = useC();
  if (!promise) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s2 }]}>SÖZ VE GERÇEK</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => { H.tap(); onPress?.(); }}
        style={({ pressed }) => [styles.card, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.elev }]}
      >
        <View style={styles.flex}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{promise.title}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 }]}>{promise.body}</Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  card: { flexDirection: "row", alignItems: "center", gap: STEP.s2, padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  flex: { flex: 1 },
});
