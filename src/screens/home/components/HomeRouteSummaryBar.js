import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { LockedValue } from "../../../components/design/LockedValue";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import { useCountUp } from "../../../hooks/useCountUp";

// "Rotanın tamamı · X/Y durak · Z sa borç" seridi (tasarim birimi SAAT).
// Ücretsizde deger
// LockedValue ile kilitlenir, bos rotada tek satir bilgi gosterir.
export function HomeRouteSummaryBar({ hasAccess, total, done, debtHours, onPress }) {
  const countedDone = useCountUp(done);
  const C = useC();

  if (total === 0) {
    return (
      <Press haptic="none"
        onPress={() => { H.tap(); onPress?.(); }}
        style={s.wrap}
        accessibilityRole="button"
        accessibilityLabel="Rotanda henüz durak yok"
      >
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>Rotanda henüz durak yok</Text>
        <Icon name="chevR" size={16} color={C.text3} />
      </Press>
    );
  }

  return (
    <Press haptic="none"
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
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>{countedDone}/{total} durak</Text>
        ) : (
          <LockedValue value={`${done}/${total} durak`} variant="bodyMedium" />
        )}
        {debtHours > 0 ? (
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{debtHours} sa borç</Text>
        ) : null}
        <Icon name="chevR" size={16} color={C.text3} />
      </View>
    </Press>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: STEP.s2,
  },
  values: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
});
