import { Pressable, View, Text, Switch, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

/**
 * Tasarimin ayar satiri: etiket + (alt aciklama) + sagda deger + chevron.
 *
 * Eski hali her satira ayri renkli bir ikon kutusu koyuyordu (C.blue,
 * C.teal, C.amber...). Bu renkler ders paletinin takma adlari; "Sifre
 * Degistir" bir ders degil, dolayisiyla ders rengiyle boyanmaz (AGENTS.md).
 * `icon` prop'u geriye donuk uyumluluk icin kabul ediliyor ama artik
 * cizilmiyor -- cagri yerlerini tek tek degistirmeye gerek kalmasin.
 *
 * `danger`: yikici aksiyon (cikis yap / hesabi sil).
 */
export function SettingsRow({
  label, hint, value, toggle, onToggle, onPress, disabled, danger, first,
}) {
  const C = useC();

  const content = (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text
          style={[TYPOGRAPHY.bodyMedium, { color: danger ? C.danger : C.text }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {hint ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 3 }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>

      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: C.track, true: C.accent }}
          thumbColor={C.accentInk}
        />
      ) : (
        <>
          {value != null && value !== "" ? (
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {onPress ? <Icon name="chevR" size={13} color={C.text5} /> : null}
        </>
      )}
    </View>
  );

  const border = first ? null : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line };

  if (toggle || !onPress) return <View style={[styles.wrapper, border]}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
      style={({ pressed }) => [styles.wrapper, border, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: STEP.s3, justifyContent: "center", minHeight: CONTROL.tapMin + 12 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  body: { flex: 1, minWidth: 0 },
});
