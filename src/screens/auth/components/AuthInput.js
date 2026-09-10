import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  error,
}) {
  const C = useC();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = !!secureTextEntry;

  const borderColor = error ? C.danger : focused ? C.accent : C.elev;

  return (
    <View style={{ marginBottom: STEP.s2 }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s1 }]}>
        {label}
      </Text>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderRadius: SHAPE.card,
        borderWidth: 1,
        borderColor,
        height: CONTROL.buttonPrimary + 2,
        paddingHorizontal: STEP.s2 + STEP.s1 / 2,
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.text3}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[TYPOGRAPHY.bodyMedium, { flex: 1, color: C.text }]}
        />
        {isPassword ? (
          <Pressable onPress={() => setShow((v) => !v)} hitSlop={10} style={{ padding: STEP.s1 }} accessibilityRole="button" accessibilityLabel={show ? "Şifreyi gizle" : "Şifreyi göster"}>
            <Icon name={show ? "eyeOff" : "eye"} size={17} color={C.text4} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[TYPOGRAPHY.micro, { color: C.danger, marginTop: STEP.s1 / 2, marginLeft: 4 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
