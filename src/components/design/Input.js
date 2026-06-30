import { useState, useCallback } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled,
  multiline,
  maxLength,
  keyboardType,
  secureTextEntry,
  autoCapitalize = "none",
  style,
  inputStyle,
  ...rest
}) {
  const C = useC();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? C.danger : focused ? C.accent : C.border;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: C.sec }]}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        editable={!disabled}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          {
            color: C.text,
            backgroundColor: C.surface,
            borderColor,
          },
          multiline && styles.multiline,
          disabled && { opacity: 0.5 },
          inputStyle,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: C.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: { ...TYPOGRAPHY.captionMedium, marginLeft: SPACING.xs },
  input: {
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  multiline: { minHeight: 100, textAlignVertical: "top", paddingTop: SPACING.md },
  error: { ...TYPOGRAPHY.micro, marginLeft: SPACING.xs },
});
