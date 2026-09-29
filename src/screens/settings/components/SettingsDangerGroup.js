import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsRow } from "./SettingsRow";
import { GUTTER, STEP } from "../../../themes/tokens";

// Tehlikeli grup (cikis yap / hesabi sil): kutusuz, kirmizi metinli satirlar.
export function SettingsDangerGroup({ onLogout, onDeleteAccount }) {
  return (
    <View style={styles.container}>
      <SettingsRow first label="Çıkış yap" danger onPress={onLogout} />
      <SettingsRow label="Hesabımı sil" danger onPress={onDeleteAccount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: STEP.s4,
    paddingHorizontal: GUTTER,
  },
});
