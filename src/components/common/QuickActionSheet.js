import { useCallback, useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet, Platform } from "react-native";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";

function ActionRow({ item, onPress, C }) {
  const handlePress = useCallback(() => onPress(item.screen), [item.screen, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: item.color + "12",
          borderColor: item.color + "26",
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={22} color="#FFFFFF" sw={2.3} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.label, { color: C.text }]}>{item.label}</Text>
        <Text style={[styles.desc, { color: C.sec }]}>{item.desc}</Text>
      </View>
      <Icon name="chevR" size={18} color={C.muted} />
    </Pressable>
  );
}

export function QuickActionSheet({ visible, onClose, onAction }) {
  const C = useC();
  const ACTIONS = useMemo(() => [
    { key: "study",  icon: "edit",     label: "Çalışma Kaydet",  desc: "Ders çalışmanı kaydet",       screen: SCREENS.ADD_STUDY,       color: C.amber },
    { key: "trial",  icon: "chart",    label: "Deneme Gir",      desc: "Deneme sonuçlarını gir",      screen: SCREENS.TRIAL_ENTRY,     color: C.blue },
    { key: "wrong",  icon: "camera",   label: "Yanlış Ekle",     desc: "Yanlış soruyu kaydet",        screen: SCREENS.ADD_WRONG,       color: C.coral },
    { key: "wrnb",   icon: "notebook", label: "Yanlış Defteri",  desc: "Eklediğin yanlışları gör",    screen: SCREENS.WRONG_NOTEBOOK,  color: C.purple },
  ], [C]);
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
        <Pressable style={[styles.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />
          <Text style={[styles.sheetTitle, { color: C.text }]}>Hızlı Aksiyon</Text>
          <View style={styles.actions}>
            {ACTIONS.map((a) => (
              <ActionRow key={a.key} item={a} onPress={handleAction} C={C} />
            ))}
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeText, { color: C.muted }]}>Kapat</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    ...TYPOGRAPHY.subheading,
    fontSize: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  actions: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  rowText: { flex: 1 },
  label: { ...TYPOGRAPHY.bodySemiBold, fontSize: 15 },
  desc: { ...TYPOGRAPHY.caption, marginTop: 2 },
  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: SPACING.md,
  },
  closeText: { ...TYPOGRAPHY.bodySemiBold },
});
