import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

import { Icon, AnimatedPressable } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, STEP, RADIUS } from "../../../themes/tokens";
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
    <View
      style={[
        s.card,
        { backgroundColor: C.surface, borderColor: C.border },
      ]}
    >
      <Text style={[s.label, { color: C.sec }]}>GRUP DAVET KODU</Text>
      <Text style={[TYPOGRAPHY.caption, s.groupName, { color: C.text2 }]} numberOfLines={1}>
        {group.name}
      </Text>

      <Text style={[s.code, { color: C.accent }]}>{group.code || "..."}</Text>

      <Text style={[TYPOGRAPHY.caption, s.hint, { color: C.text3 }]}>
        Arkadaşlarını bu kodla gruba davet et, haftalık sıralamada yarışın.
      </Text>

      <View style={s.actions}>
        <AnimatedPressable
          onPress={handleCopy}
          haptic="tap"
          accessibilityRole="button"
          accessibilityLabel="Grup kodunu kopyala"
          style={[
            s.actionBtn,
            {
              backgroundColor: C.surface,
              borderColor: copied ? C.green : C.border,
            },
          ]}
        >
          <Icon
            name={copied ? "check" : "copy"}
            size={16}
            color={copied ? C.green : C.text}
          />
          <Text
            style={[
              s.actionBtnText,
              { color: copied ? C.green : C.text },
            ]}
          >
            {copied ? "Kopyalandı" : "Kopyala"}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleShare}
          haptic="medium"
          accessibilityRole="button"
          accessibilityLabel="Grup kodunu paylaş"
          style={[
            s.actionBtn,
            {
              backgroundColor: C.accent,
              borderColor: C.accent,
            },
          ]}
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
    alignItems: "center",
    padding: SPACING.xl,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  groupName: {
    marginBottom: SPACING.xs,
  },
  code: {
    ...TYPOGRAPHY.display,
    letterSpacing: 4,
    marginVertical: SPACING.xs,
  },
  hint: {
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: STEP.s2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  actionBtnText: {
    ...TYPOGRAPHY.bodySemiBold,
  },
});
