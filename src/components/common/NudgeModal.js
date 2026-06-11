import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { Icon } from "../design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";

const PRIORITY_COLOR = { high: C.red, medium: C.amber, low: C.green };
const PRIORITY_ICON = { high: "alertTriangle", medium: "bell", low: "trendUp" };

function NudgeItem({ nudge, onAction }) {
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
}

export function NudgeModal({ visible, nudges, onClose, onAction }) {
  if (!nudges || nudges.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Bugunun Onerileri</Text>
          <FlatList
            data={nudges}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <NudgeItem nudge={item} onAction={onAction} />}
            contentContainerStyle={{ gap: SPACING.sm }}
            showsVerticalScrollIndicator={false}
          />
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Tamam</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    backgroundColor: C.bg,
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
    color: C.sec,
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
  closeBtn: {
    alignSelf: "center",
    marginTop: SPACING.lg,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: C.amber,
    borderRadius: RADIUS.lg,
  },
  closeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: C.bg,
  },
});
