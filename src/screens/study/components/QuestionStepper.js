import { View, Text, Pressable, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { Icon } from "../../../components/design";
import { SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function QuestionStepper({ value, onChange }) {
  const C = useC();
  const [focused, setFocused] = useState(false);

  const decrement = useCallback(() => {
    const next = Math.max(0, value - 1);
    onChange(next);
  }, [value, onChange]);

  const increment = useCallback(() => {
    onChange(value + 1);
  }, [value, onChange]);

  const handleText = useCallback(
    (text) => {
      const num = parseInt(text, 10);
      onChange(isNaN(num) ? 0 : Math.max(0, num));
    },
    [onChange]
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: focused ? C.accent : C.border,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={decrement}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <View
          style={{
            width: 20,
            height: 2,
            backgroundColor: C.sec,
            borderRadius: 1,
          }}
        />
      </Pressable>

      <TextInput
        value={String(value)}
        onChangeText={handleText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 18,
          color: C.text,
          paddingVertical: SPACING.md,
        }}
      />

      <Pressable
        onPress={increment}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Icon name="plus" size={18} color={C.accent} />
      </Pressable>
    </View>
  );
}
