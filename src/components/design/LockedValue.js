import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../themes/tokens";

// Ucretsiz/Pro ayriminin gorsel dili: deger bulaniklastirilir, yaninda kucuk
// kilit durur. Deger SILINMEZ — gorunmez olur. Ton kayip degil, davet.
//
// Bulaniklik icin native bagimlilik (expo-blur) yerine metin golgesi
// kullaniliyor: yazi rengi seffaf, golge gercek renk. Iki platformda da
// gercek bir bulaniklik verir ve build'i degistirmez.

export function LockedValue({
  value,
  locked = true,
  variant = "stat",
  onPress,
  label = "Pro ile acilir",
  showLock = true,
  style,
}) {
  const C = useC();
  const type = TYPOGRAPHY[variant] || TYPOGRAPHY.stat;

  const handlePress = useCallback(() => { onPress?.(); }, [onPress]);

  if (!locked) {
    return <Text style={[type, { color: C.text }, style]}>{value}</Text>;
  }

  const blurRadius = Math.max(6, Math.round(type.fontSize * 0.28));
  const iconSize = Math.max(12, Math.round(type.fontSize * 0.42));

  const body = (
    <View style={[styles.row, style]}>
      <Text
        style={[
          type,
          styles.blurred,
          { textShadowColor: C.text2, textShadowRadius: blurRadius },
        ]}
        allowFontScaling={false}
      >
        {value}
      </Text>
      {showLock ? (
        <Icon name="lock" size={iconSize} color={C.text3} sw={2} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label} accessibilityState={{ disabled: true }}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.press, pressed && { opacity: 0.7 }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  blurred: {
    color: "transparent",
    textShadowOffset: { width: 0, height: 0 },
  },
  press: {
    minHeight: CONTROL.tapMin,
    justifyContent: "center",
  },
});
