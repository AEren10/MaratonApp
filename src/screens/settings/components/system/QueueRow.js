import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

// KUYRUKTA satiri: saat isareti, kayit adi + ayrinti, BEKLİYOR.
function QueueRowBase({ title, meta }) {
  const C = useC();
  return (
    <View style={[styles.row, { borderTopColor: C.line }]} accessible accessibilityLabel={`${title}. ${meta || ""}. Bekliyor`}>
      <Icon name="clock" size={16} color={C.text4} />
      <View style={styles.flex}>
        <Text numberOfLines={1} style={[TYPOGRAPHY.captionMedium, styles.title, { color: C.text }]}>{title}</Text>
        {meta ? (
          <Text numberOfLines={1} style={[TYPOGRAPHY.micro, styles.meta, { color: C.text3 }]}>{meta}</Text>
        ) : null}
      </View>
      <Text style={[TYPOGRAPHY.label, styles.tag, { color: C.warn }]}>BEKLİYOR</Text>
    </View>
  );
}

export const QueueRow = memo(QueueRowBase);

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
  tag: { letterSpacing: 1.6 },
});
