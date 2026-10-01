import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";
import { useMyAvatar } from "../../../hooks/useMyAvatar";

// Kutusuz kimlik satiri: avatar + ad + meta, altinda ince ayirici.
export function SettingsIdentityCard({
  displayName,
  examLabel,
  daysLeft,
  onPress,
}) {
  const C = useC();
  const avatarUrl = useMyAvatar();

  const daysText = daysLeft != null
    ? (daysLeft > 0 ? `${daysLeft} gün kaldı` : daysLeft === 0 ? "Bugün sınav günü" : "Sınav tamamlandı")
    : null;

  const metaText = [examLabel, daysText].filter(Boolean).join(" · ");
  const initial = (displayName || "?").slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <Press
        haptic="none"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${displayName || "Profil"}, profili düzenle`}
        style={[
          styles.row,
          {
            borderBottomWidth: 1,
            borderBottomColor: C.line,
          },
        ]}
      >
        <Avatar
          init={initial}
          image={avatarUrl}
          size={44}
          color={C.accent}
          ring={1}
        />

        <View style={styles.info}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>
            {displayName || "Profilim"}
          </Text>
          {metaText ? (
            <Text style={[TYPOGRAPHY.caption, styles.meta, { color: C.text3 }]} numberOfLines={1}>
              {metaText}
            </Text>
          ) : null}
        </View>

        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s3,
    minHeight: CONTROL.tapMin + 12,
  },
  info: {
    flex: 1,
    marginLeft: STEP.s2 + 2,
    marginRight: STEP.s1,
  },
  meta: {
    marginTop: 2,
  },
});
