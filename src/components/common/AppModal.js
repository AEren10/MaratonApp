import { useCallback } from "react";
import { View, Text, Pressable, Modal, Platform, StyleSheet } from "react-native";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

export function AppModal({ visible, onClose, title, message, actions = [], icon, iconColor }) {
  const C = useC();

  return (
    <Modal visible={visible} transparent animationType={Platform.OS === "web" ? "none" : "slide"} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: (iconColor || C.accent) + "18" }]}>
              <Icon name={icon} size={28} color={iconColor || C.accent} />
            </View>
          ) : null}

          {title ? <Text style={[styles.title, { color: C.text }]}>{title}</Text> : null}
          {message ? <Text style={[styles.message, { color: C.sec }]}>{message}</Text> : null}

          <View style={styles.actions}>
            {actions.map((a) => {
              const color = a.color || C.accent;
              const isDestructive = a.style === "destructive";
              const isCancel = a.style === "cancel";

              if (isCancel) {
                return (
                  <Pressable
                    key={a.label}
                    onPress={() => { onClose(); a.onPress?.(); }}
                    style={({ pressed }) => [styles.cancelBtn, { backgroundColor: C.surface2 }, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={[styles.cancelText, { color: C.muted }]}>{a.label}</Text>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={a.label}
                  onPress={() => { onClose(); a.onPress?.(); }}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: isDestructive ? C.danger + "14" : color + "14", borderColor: isDestructive ? C.danger + "30" : color + "30" },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  {a.icon ? <Icon name={a.icon} size={18} color={isDestructive ? C.danger : color} /> : null}
                  <Text style={[styles.actionText, { color: isDestructive ? C.danger : color }]}>{a.label}</Text>
                </Pressable>
              );
            })}
          </View>
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
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 21,
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  actionText: {
    ...TYPOGRAPHY.bodySemiBold,
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  cancelText: {
    ...TYPOGRAPHY.bodySemiBold,
  },
});
