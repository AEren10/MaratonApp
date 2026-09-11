import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Dort kaynaktan biri: sira numarasi + bolum etiketi + baslik + govde.
// Kaynaklar ders degil, bu yuzden ders rengi kullanilmiyor.
export const HowItWorksSource = React.memo(function HowItWorksSource({ C, source, index }) {
  return (
    <Card tone="surface" radius="sheet" style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.num, { borderColor: C.border }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]} allowFontScaling={false}>
            {index}
          </Text>
        </View>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright, flex: 1 }]}>
          {source.eyebrow}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.bodyMedium, styles.title, { color: C.text }]}>
        {source.title}
      </Text>
      <Text style={[TYPOGRAPHY.meta, styles.body, { color: C.text2 }]}>{source.body}</Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: STEP.s2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2 },
  num: {
    width: 22,
    height: 22,
    borderRadius: 1,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginTop: STEP.s2 },
  body: { marginTop: 6, lineHeight: 20 },
});
