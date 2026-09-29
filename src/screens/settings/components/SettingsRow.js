import { View, Text, Switch, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";

/**
 * Tasarimin ayar satiri: etiket + (alt aciklama) + sagda deger + chevron.
 * Kutusuz, zeminde duran satir. Satirlar arasinda 1px C.line ayirici.
 * Dokunma alani ve satir yuksekligi en az 48-52px.
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
          {onPress ? <Icon name="chevR" size={13} color={danger ? C.danger : C.text3} /> : null}
        </>
      )}
    </View>
  );

  const border = first ? null : { borderTopWidth: 1, borderTopColor: C.line };

  if (toggle || !onPress) return <View style={[styles.wrapper, border]}>{content}</View>;

  return (
    <Press
      haptic="none"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
      style={[styles.wrapper, border]}
    >
      {content}
    </Press>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    minHeight: CONTROL.tapMin + 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
  },
  body: { flex: 1, minWidth: 0 },
});
