import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

export const TrialRecordUnlockCard = React.memo(function TrialRecordUnlockCard({ lockedCount, onPress, C }) {
  if (lockedCount <= 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={[styles.lockIconBox, { backgroundColor: C.void, borderColor: C.elev }]}>
        <Icon name="lock" size={12} color={C.text3} />
      </View>

      {/* Blurred mock rows */}
      <View style={styles.blurRows}>
        <View style={styles.blurRow}>
          <View style={[styles.blurBadge, { backgroundColor: C.elev }]} />
          <View style={[styles.blurLine, { backgroundColor: C.elev }]} />
          <View style={[styles.blurScore, { backgroundColor: C.elev }]} />
        </View>
        <View style={styles.blurRow}>
          <View style={[styles.blurBadge, { backgroundColor: C.elev }]} />
          <View style={[styles.blurLine, { backgroundColor: C.elev }]} />
          <View style={[styles.blurScore, { backgroundColor: C.elev }]} />
        </View>
      </View>

      <Text style={[styles.desc, { color: C.text3 }]}>
        Son 8 hafta açık. {lockedCount || 16} daha eski deneme kayıtlı.
      </Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Tüm geçmişi aç"
        style={({ pressed }) => [
          styles.btn,
          {
            borderColor: C.accent,
            backgroundColor: pressed ? (C.brandTint || C.elev) : "transparent",
          },
        ]}
      >
        <Icon name="lock" size={13} color={C.accent} />
        <Text style={[styles.btnText, { color: C.accentBright }]}>Tüm geçmişi aç</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    position: "relative",
  },
  lockIconBox: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  blurRows: {
    gap: 14,
    opacity: 0.55,
  },
  blurRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  blurBadge: {
    width: 30,
    height: 16,
    borderRadius: 4,
  },
  blurLine: {
    flex: 1,
    height: 11,
    borderRadius: 4,
  },
  blurScore: {
    width: 42,
    height: 16,
    borderRadius: 4,
  },
  desc: {
    fontFamily: "Archivo_500",
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: 16,
    textAlign: "center",
  },
  btn: {
    height: 46,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontFamily: "Archivo_600",
    fontSize: 13,
  },
});