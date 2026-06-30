import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { Icon, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { getSubjectByKey } from "../../themes/subjects";

const NudgeItem = React.memo(function NudgeItem({ nudge, onAction, C, styles }) {
  const PRIORITY_COLOR = { high: C.red, medium: C.amber, low: C.green };
  const PRIORITY_ICON = { high: "alert", medium: "bell", low: "trendUp" };
  const color = PRIORITY_COLOR[nudge.priority] || C.amber;
  const icon = PRIORITY_ICON[nudge.priority] || "bell";
  const subj = nudge.subject ? getSubjectByKey(nudge.subject) : null;

  return (
    <View style={[styles.item, { borderLeftColor: color }]}>
      <View style={styles.itemHeader}>
        <Icon name={icon} size={16} color={color} />
        {subj && (
          <View style={[styles.badge, { backgroundColor: subj.color + "22" }]}>
            <Text style={[styles.badgeText, { color: subj.color }]}>{subj.label}</Text>
          </View>
        )}
      </View>
      <Text style={styles.message}>{nudge.message}</Text>
      {nudge.actionLabel && (
        <Pressable onPress={() => onAction(nudge)} style={[styles.actionBtn, { borderColor: color + "60" }]}>
          <Text style={[styles.actionText, { color }]}>{nudge.actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
});

export function NudgeModal({ visible, nudges, onClose, onAction }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const renderNudgeItem = useCallback(({ item }) => (
    <NudgeItem nudge={item} onAction={onAction} C={C} styles={styles} />
  ), [onAction, C, styles]);

  if (!nudges || nudges.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Bugünün Önerileri</Text>
          <FlatList
            data={nudges}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderNudgeItem}
            contentContainerStyle={{ gap: SPACING.sm }}
            showsVerticalScrollIndicator={false}
          />
          <Button onPress={onClose} fullWidth>Tamam</Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: C.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: SPACING.lg,
      maxHeight: "70%",
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.border,
      alignSelf: "center",
      marginBottom: SPACING.lg,
    },
    title: {
      ...TYPOGRAPHY.heading,
      color: C.text,
      fontSize: 18,
      marginBottom: SPACING.lg,
    },
    item: {
      backgroundColor: C.surface2,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      borderLeftWidth: 3,
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
    },
    message: {
      ...TYPOGRAPHY.body,
      color: C.text,
      lineHeight: 20,
    },
    actionBtn: {
      alignSelf: "flex-start",
      marginTop: SPACING.sm,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
    },
  });
}
