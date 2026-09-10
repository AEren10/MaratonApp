import { View, Text, StyleSheet } from "react-native";
import { Button } from "./Button";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";
import { EMPTY_COPY } from "../../constants/stateCopy";

// Bos durum. Kopya src/constants/stateCopy.js'ten gelir (tasarimdan birebir).
// `preset` ile hazir metin, ya da title/body/primary elle verilir.
// children: stat, seri seridi gibi ekrana ozel govde (Seri Sifir, Analiz Veri Yetersiz).
export function EmptyState({
  preset,
  eyebrow,
  title,
  body,
  primary,
  secondary,
  onPrimary,
  onSecondary,
  children,
  style,
}) {
  const C = useC();
  const p = (preset && EMPTY_COPY[preset]) || {};

  const _eyebrow = eyebrow ?? p.eyebrow;
  const _title = title ?? p.title;
  const _body = body ?? p.body;
  const _primary = primary ?? p.primary;
  const _secondary = secondary ?? p.secondary;

  return (
    <View style={[styles.wrap, style]}>
      {_eyebrow ? (
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{_eyebrow}</Text>
      ) : null}

      {children}

      {_title ? (
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginTop: STEP.s2 }]}>
          {_title}
        </Text>
      ) : null}

      {_body ? (
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>
          {_body}
        </Text>
      ) : null}

      {_primary || _secondary ? (
        <View style={styles.actions}>
          {_primary ? (
            <Button variant="primary" size="lg" fullWidth onPress={onPrimary}>
              {_primary}
            </Button>
          ) : null}
          {_secondary ? (
            <Button variant="ghost" size="md" fullWidth onPress={onSecondary}>
              {_secondary}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: STEP.s4 },
  actions: { marginTop: STEP.s4, gap: STEP.s1 },
});
