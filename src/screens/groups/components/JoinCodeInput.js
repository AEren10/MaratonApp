import { View, TextInput, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

export function JoinCodeInput({ value, onChangeText, error, disabled }) {
  const C = useC();

  const handleChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: C.text2 }]}>6 Haneli Katılım Kodu</Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: C.surface,
            borderColor: error ? C.danger : value.length === 6 ? C.accent : C.border,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="ÖRN: MRT948"
          placeholderTextColor={C.text3}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled}
          style={[styles.input, { color: C.text }]}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
      ) : (
        <Text style={[styles.hintText, { color: C.text3 }]}>
          Arkadaşının paylaştığı 6 haneli kodu gir.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SHAPE.chip,
  },
  label: {
    ...TYPOGRAPHY.captionMedium,
  },
  inputWrapper: {
    height: CONTROL.buttonPrimary,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1.5,
    paddingHorizontal: STEP.s3,
    justifyContent: "center",
  },
  input: {
    ...TYPOGRAPHY.statMedium,
    letterSpacing: 4,
    textAlign: "center",
  },
  errorText: {
    ...TYPOGRAPHY.micro,
  },
  hintText: {
    ...TYPOGRAPHY.micro,
  },
});
