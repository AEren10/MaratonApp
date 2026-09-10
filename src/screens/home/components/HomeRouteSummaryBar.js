import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { LockedValue } from "../../../components/design/LockedValue";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// "Rotanın tamamı · X/Y durak · Z sa borç" seridi (tasarim birimi SAAT).
// Ücretsizde deger
// LockedValue ile kilitlenir, bos rotada tek satir bilgi gosterir.
export function HomeRouteSummaryBar({ hasAccess, total, done, debtHours, onPress }) {
  const C = useC();

  if (total === 0) {
    return (
      <Pressable
        onPress={() => { H.tap(); onPress?.(); }}
        style={s.wrap}
        accessibilityRole="button"
        accessibilityLabel="Rotanda henüz durak yok"
      >
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>Rotanda henüz durak yok</Text>
        <Icon name="chevR" size={16} color={C.text3} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => { H.tap(); onPress?.(); }}
      style={s.wrap}
      accessibilityRole="button"
      accessibilityLabel="Rotanın tamamını gör"
    >
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>Rotanın tamamı</Text>
      <View style={[s.dot, { backgroundColor: C.text3 }]} />
      {hasAccess ? (
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{done}/{total} durak</Text>
      ) : (
        <LockedValue value={`${done}/${total} durak`} variant="bodyMedium" />
      )}
      {debtHours > 0 ? (
        <>
          <View style={[s.dot, { backgroundColor: C.text3 }]} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{debtHours} sa borç</Text>
        </>
      ) : null}
      <Icon name="chevR" size={16} color={C.text3} style={s.chev} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", paddingVertical: STEP.s2 },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: STEP.s1 },
  chev: { marginLeft: "auto" },
});
