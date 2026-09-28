import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsRow } from "./SettingsRow";
import { GUTTER, RADIUS, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function SettingsDangerGroup({ onLogout, onDeleteAccount }) {
  const C = useC();
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <SettingsRow first label="Çıkış yap" danger onPress={onLogout} />
        <SettingsRow label="Hesabımı sil" danger onPress={onDeleteAccount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: STEP.s4,
    paddingHorizontal: GUTTER,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
});
