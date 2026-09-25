import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// GONDERILEMEYEN satiri: kayit adi + ayrinti, sagda "Sil".
//
// Silme burada duruyor cunku kullanicinin tek cikisi buydu: sunucu kaydi
// kabul etmiyorsa serit sonsuza kadar ana ekranda kaliyor ve vazgecmenin
// yolu yalnizca Ayarlar'in icine gomulu bir satirdi.
function FailedRowBase({ title, meta, onDiscard }) {
  const C = useC();
  return (
    <View
      style={[styles.row, { borderTopColor: C.line }]}
      accessible
      accessibilityLabel={`${title}. ${meta || ""}. Gönderilemedi`}
    >
      <Icon name="alert" size={16} color={C.danger} />
      <View style={styles.flex}>
        <Text numberOfLines={1} style={[TYPOGRAPHY.captionMedium, styles.title, { color: C.text }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[TYPOGRAPHY.micro, styles.meta, { color: C.text3 }]}>
          {meta ? `${meta} · sunucu kabul etmedi` : "Sunucu bu kaydı kabul etmedi"}
        </Text>
      </View>
      <Press haptic="none"
        onPress={onDiscard}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`${title} kaydını sil`}
        style={styles.action}
      >
        <Text style={[TYPOGRAPHY.label, styles.tag, { color: C.text3 }]}>SİL</Text>
      </Press>
    </View>
  );
}

export const FailedRow = memo(FailedRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 2,
    paddingVertical: STEP.s2 + 3,
    borderTopWidth: 1,
  },
  flex: { flex: 1, minWidth: 0 },
  title: { fontFamily: TYPOGRAPHY.metaSemiBold.fontFamily },
  meta: { marginTop: STEP.s1 / 2 - 1, fontFamily: TYPOGRAPHY.caption.fontFamily },
  action: { minHeight: CONTROL.tapMin, justifyContent: "center", paddingLeft: STEP.s2 },
  tag: { letterSpacing: 1.6 },
});
