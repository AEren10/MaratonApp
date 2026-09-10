import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "./Button";
import { Card } from "./Card";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";
import { ERROR_COPY } from "../../constants/stateCopy";

// Hata durumu. Tasarim kurali: suc kullanicida degil ("Bizde bir sorun var."),
// hata kodu ana metnin icine sokulmaz — altta kopyalanabilir satir olarak durur.
export function ErrorState({
  preset,
  title,
  body,
  primary,
  secondary,
  onPrimary,
  onSecondary,
  code,
  children,
  style,
}) {
  const C = useC();
  const p = (preset && ERROR_COPY[preset]) || {};

  const _title = title ?? p.title;
  const _body = body ?? p.body;
  const _primary = primary ?? p.primary;
  const _secondary = secondary ?? p.secondary;

  return (
    <View style={[styles.wrap, style]}>
      {_title ? (
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>{_title}</Text>
      ) : null}

      {_body ? (
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>
          {_body}
        </Text>
      ) : null}

      {children}

      <View style={styles.actions}>
        {_primary ? (
          <Button variant="primary" size="lg" fullWidth onPress={onPrimary}>
            {_primary}
          </Button>
        ) : null}
        {_secondary ? (
          <Button variant="outline" size="lg" fullWidth onPress={onSecondary}>
            {_secondary}
          </Button>
        ) : null}
      </View>

      {p.hint ? (
        <Card tone="void" radius="cardTight" style={styles.hint}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{p.hint.label}</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: 6 }]}>
            {p.hint.text}
          </Text>
        </Card>
      ) : null}

      {code ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Hata kodunu kopyala: ${code}`}
          onPress={() => Clipboard.setStringAsync(code)}
          style={styles.codeRow}
        >
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Hata kodu {code}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.accentBright }]}>Kopyala</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: STEP.s4 },
  actions: { marginTop: STEP.s4, gap: STEP.s1 },
  hint: { marginTop: STEP.s3 },
  codeRow: {
    marginTop: STEP.s3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
});
