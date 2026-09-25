import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TYPOGRAPHY, STEP, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { DialogAction } from "./appModal/DialogAction";
import { Press } from "../../components/design/Press";

const WARNING_ICONS = ["alert", "warning", "alertTriangle"];

// Tasarim "Onay" (Dialog) + "Uyarı" isareti. Alttan 16px iceride yuzen
// panel, r32, yuzey + 1px elev kenar; golge yok. Ikon kutusu yok:
// uyari hali basliga "Uyarı" seridindeki kare warn isaretini ekler.
//
// API degismedi: { visible, onClose, title, message, actions, icon, iconColor }.
// actions[i] = { label, style: "cancel" | "destructive" | undefined, onPress }.
// Iki aksiyon yan yana (Vazgec solda), uc ve fazlasi alt alta (Vazgec en altta).
export function AppModal({ visible, onClose, title, message, actions = [], icon, iconColor, variant }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const isWarning = variant === "warning"
    || WARNING_ICONS.includes(icon)
    || (iconColor != null && (iconColor === C.danger || iconColor === C.warn));

  const list = actions.length ? actions : [{ label: "Tamam", style: "cancel" }];
  const row = list.length === 2;
  const cancels = list.filter((a) => a.style === "cancel");
  const others = list.filter((a) => a.style !== "cancel");
  const ordered = row ? [...cancels, ...others] : [...others, ...cancels];
  const soloInfo = list.length === 1;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: C.scrim }]} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable
          accessibilityViewIsModal
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.dialog,
            { marginBottom: insets.bottom + STEP.s3, backgroundColor: C.surface, borderColor: C.elev },
          ]}
        >
          {title ? (
            <View style={styles.titleRow}>
              {isWarning ? <View style={[styles.mark, { backgroundColor: C.warn }]} /> : null}
              <Text accessibilityRole="header" style={[TYPOGRAPHY.subheading, styles.flex, { color: C.text }]}>
                {title}
              </Text>
            </View>
          ) : null}
          {message ? (
            <Text style={[TYPOGRAPHY.body, styles.message, { color: C.text3 }]}>{message}</Text>
          ) : null}

          <View style={[styles.actions, row ? styles.actionsRow : styles.actionsCol]}>
            {ordered.map((a, i) => (
              <DialogAction
                key={`${a.label}-${i}`}
                label={a.label}
                kind={soloInfo && !a.style && !a.onPress ? "cancel" : a.style}
                stretch={row}
                onPress={() => { onClose(); a.onPress?.(); }}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  dialog: {
    marginHorizontal: STEP.s2 + 4,
    paddingVertical: STEP.s3 + 6,
    paddingHorizontal: STEP.s3 + 4,
    borderRadius: SHAPE.sheet + STEP.s1,
    borderWidth: 1,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  flex: { flex: 1 },
  mark: { width: 9, height: 9, borderRadius: SHAPE.chip / 6 },
  message: { marginTop: STEP.s2 },
  actions: { marginTop: STEP.s3 + 6, gap: STEP.s2 },
  actionsRow: { flexDirection: "row" },
  actionsCol: { flexDirection: "column" },
});
