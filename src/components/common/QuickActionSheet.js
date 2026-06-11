import { useCallback } from "react";
import { View, Text, Pressable, Modal, StyleSheet, Platform } from "react-native";
import { Icon, IconBox } from "../design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

const ACTIONS = [
  { key: "study", icon: "edit", label: "Calisma Kaydet", desc: "Ders calismani kaydet", color: C.amber, screen: "AddStudy" },
  { key: "trial", icon: "chart", label: "Deneme Gir", desc: "Deneme sonuclarini gir", color: C.blue, screen: "TrialEntry" },
  { key: "wrong", icon: "camera", label: "Yanlis Ekle", desc: "Yanlis soruyu kaydet", color: C.red, screen: "AddWrong" },
];

function ActionRow({ item, onPress }) {
  const handlePress = useCallback(() => onPress(item.screen), [item.screen, onPress]);

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.row}>
        <IconBox icon={item.icon} color={item.color} size={44} rounded={RADIUS.md} />
        <View style={styles.rowText}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
        <Icon name="chevR" size={18} color={C.muted} />
      </View>
    </Pressable>
  );
}

export function QuickActionSheet({ visible, onClose, onAction }) {
  const handleAction = useCallback(
    (screen) => {
      onClose();
      setTimeout(() => onAction(screen), 100);
    },
    [onAction, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType={Platform.OS === "web" ? "none" : "fade"} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.actions}>
            {ACTIONS.map((a) => (
              <ActionRow key={a.key} item={a} onPress={handleAction} />
            ))}
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Icon name="x" size={20} color={C.sec} />
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.muted,
    alignSelf: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  actions: { gap: SPACING.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  rowText: { flex: 1 },
  label: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  desc: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  closeText: { ...TYPOGRAPHY.bodySemiBold, color: C.sec },
});
