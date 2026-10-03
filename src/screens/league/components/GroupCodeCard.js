import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

import { Icon, AnimatedPressable } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupCodeCard({ group, onShare }) {
  const C = useC();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!group?.code) return;
    await Clipboard.setStringAsync(group.code);
    H.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [group?.code]);

  const handleShare = useCallback(() => {
    if (!group) return;
    H.medium();
    onShare?.(group);
  }, [group, onShare]);

  if (!group) return null;

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.header}>
        <View style={s.copy}>
          <Text style={[s.label, { color: C.sec }]}>DAVET KODU</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]} numberOfLines={1}>
            Arkadaşların bu kodla katılır.
          </Text>
        </View>
        <View style={[s.codePill, { backgroundColor: C.accent + "12", borderColor: C.accent + "45" }]}>
          <Text style={[s.code, { color: C.accentText }]}>{group.code || "..."}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <AnimatedPressable
          onPress={handleCopy}
          haptic="tap"
          accessibilityRole="button"
          accessibilityLabel="Grup kodunu kopyala"
          style={[s.actionBtn, { backgroundColor: C.surface, borderColor: copied ? C.up : C.border }]}
        >
          <Icon name={copied ? "check" : "copy"} size={16} color={copied ? C.up : C.text} />
          <Text style={[s.actionBtnText, { color: copied ? C.up : C.text }]}>
            {copied ? "Kopyalandı" : "Kopyala"}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleShare}
          haptic="medium"
          accessibilityRole="button"
          accessibilityLabel="Grup kodunu paylaş"
          style={[s.actionBtn, { backgroundColor: C.brandFill || C.accent, borderColor: C.brandFill || C.accent }]}
        >
          <Icon name="share" size={16} color={C.textOnFill} />
          <Text style={[s.actionBtnText, { color: C.textOnFill }]}>Paylaş</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: "100%",
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  copy: {
    flex: 1,
  },
  label: {
    ...TYPOGRAPHY.label,
    letterSpacing: 1.3,
    marginBottom: 2,
  },
  codePill: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  code: {
    ...TYPOGRAPHY.statSmall,
    letterSpacing: 2.5,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    minHeight: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionBtnText: {
    ...TYPOGRAPHY.captionMedium,
  },
});
