import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { PAYWALL_SECTION_LABELS as L } from "../../../constants/paywallContexts";
import { PaywallBullet } from "./PaywallBullet";

/**
 * Tasarimin baglam paywall'i ("Paywall · Karşılaştırma / Senaryolar / Geçmiş"):
 * BU IS ICIN + isin ne actigi + UCRETSIZDE NE KALDIGI.
 *
 * Son bolum bilincli: paywall kayip korkusu kurmuyor, ucretsiz cekirdegin
 * yerinde durdugunu soyluyor. Metinler paywallContexts.js'te tek kaynakta.
 */
export const PaywallContextBlock = React.memo(function PaywallContextBlock({ C, context }) {
  if (!context) return null;

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{L.unlocks}</Text>
      <Text style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>{context.lead}</Text>
      <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{context.body}</Text>

      <View style={styles.list}>
        {context.unlocks.map((line) => <PaywallBullet key={line} text={line} tone="check" />)}
      </View>

      <View style={[styles.free, { borderTopColor: C.line }]}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{L.stayFree}</Text>
        <View style={styles.freeList}>
          {context.stayFree.map((line) => <PaywallBullet key={line} text={line} tone="freeMuted" />)}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  title: { marginTop: STEP.s2, maxWidth: 290 },
  body: { marginTop: STEP.s2, maxWidth: 296 },
  list: { marginTop: STEP.s3, gap: STEP.s2 },
  free: { marginTop: STEP.s3, paddingTop: STEP.s2, borderTopWidth: 1 },
  freeList: { marginTop: STEP.s2, gap: STEP.s1 },
});
