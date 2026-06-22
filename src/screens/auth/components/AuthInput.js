import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  error,
  icon,
}) {
  const C = useC();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = !!secureTextEntry;

  const borderColor = error ? C.red : focused ? C.accent : C.border;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          color: focused ? C.accent : C.muted,
          letterSpacing: 0.6,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor,
        paddingLeft: icon ? 14 : 0,
        paddingRight: isPassword ? 10 : 0,
      }}>
        {icon ? (
          <Icon name={icon} size={17} color={focused ? C.accent : C.muted} sw={1.8} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            paddingHorizontal: 14,
            paddingVertical: 15,
            fontFamily: "Inter_500Medium",
            fontSize: 15,
            color: C.text,
          }}
        />
        {isPassword ? (
          <Pressable onPress={() => setShow((v) => !v)} hitSlop={8} style={{ padding: 10 }}>
            <Icon name={show ? "eye" : "lock"} size={16} color={C.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={{ color: C.red, fontSize: 12, marginTop: 6, fontFamily: "Inter_500Medium", marginLeft: 4 }}>
          ⚠ {error}
        </Text>
      ) : null}
    </View>
  );
}
