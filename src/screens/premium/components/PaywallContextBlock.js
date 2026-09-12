import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { PAYWALL_SECTION_LABELS as L } from "../../../constants/paywallContexts";

function BulletList({ C, items, tone }) {
  return items.map((line) => (
    <View key={line} style={styles.row}>
      {tone === "unlock" ? (
        <Icon name="check" size={12} color={C.accent} sw={2.6} />
      ) : (
        <View style={[styles.dot, { backgroundColor: C.up }]} />
      )}
      <Text style={[TYPOGRAPHY.meta, styles.text, { color: C.text2 }]}>{line}</Text>
    </View>
  ));
}

/**
 * Tasarimin baglam paywall'i: nereden geldigin + bu isin ne actigi +
 * UCRETSIZDE NE KALDIGI.
 *
 * Son bolum bilincli: paywall kayip korkusu kurmuyor, ucretsiz cekirdegin
 * yerinde durdugunu soyluyor. Metinler paywallContexts.js'te tek kaynakta.
 */
export const PaywallContextBlock = React.memo(function PaywallContextBlock({ C, context }) {
  if (!context) return null;

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{context.eyebrow}</Text>
      <Text style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>{context.title}</Text>

      <Text style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.accentBright }]}>
        {L.unlocks}
      </Text>
      <Card tone="surface" radius="sheet">
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{context.lead}</Text>
        <Text style={[TYPOGRAPHY.meta, styles.body, { color: C.text2 }]}>{context.body}</Text>
        <View style={styles.list}>
          <BulletList C={C} items={context.unlocks} tone="unlock" />
        </View>
      </Card>

      <Text style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.text2 }]}>
        {L.stayFree}
      </Text>
      <Card tone="void" radius="sheet">
        <BulletList C={C} items={context.stayFree} tone="free" />
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  title: { marginTop: STEP.s1 },
  sectionLabel: { marginTop: STEP.s4, marginBottom: STEP.s2 },
  body: { marginTop: 6, lineHeight: 20 },
  list: { marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: STEP.s1 },
  dot: { width: 6, height: 6, borderRadius: 1, marginTop: 6 },
  text: { flex: 1, lineHeight: 20 },
});
