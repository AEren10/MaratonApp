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
      {/* Tasarimda baslik solda, degerler sagda — aradaki ayirici noktalar
          yok, bosluk ayiriyor. */}
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Rotanın tamamı</Text>
      <View style={s.values}>
        {hasAccess ? (
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>{done}/{total} durak</Text>
        ) : (
          <LockedValue value={`${done}/${total} durak`} variant="bodyMedium" />
        )}
        {debtHours > 0 ? (
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{debtHours} sa borç</Text>
        ) : null}
        <Icon name="chevR" size={16} color={C.text3} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: STEP.s2,
  },
  values: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
});
