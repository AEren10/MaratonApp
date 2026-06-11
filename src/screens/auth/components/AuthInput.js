import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { C } from "../../../themes/tokens";

export function AuthInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = "none", error }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          color: C.sec,
          letterSpacing: 0.4,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: C.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: error ? C.red : focused ? C.amber : C.border,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          color: C.text,
        }}
      />
      {error ? (
        <Text style={{ color: C.red, fontSize: 12, marginTop: 6, fontFamily: "Inter_500Medium" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
