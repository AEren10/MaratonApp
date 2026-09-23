import React from "react";
import { View, Text, Pressable, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function GroupCodeModal({
  visible,
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  onClose,
  busy,
  cta,
  autoCap,
  maxLen,
}) {
  const C = useC();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flex}>
        <Pressable style={s.backdrop} onPress={onClose}>
          <Pressable style={[s.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={[s.handle, { backgroundColor: C.border }]} />
            <Text style={[TYPOGRAPHY.subheading, s.sheetTitle, { color: C.text }]}>{title}</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={C.muted}
              autoCapitalize={autoCap ? "characters" : "none"}
              maxLength={maxLen}
              style={[s.input, { backgroundColor: C.surface2, borderColor: C.border, color: C.text }]}
              autoFocus
            />
            <Pressable
              onPress={onSubmit}
              disabled={busy}
              style={[s.submit, { backgroundColor: C.accent }, busy && s.busy]}
            >
              <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>{busy ? "..." : cta}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: SPACING.md },
  sheetTitle: { marginBottom: SPACING.md },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.input },
  submit: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: "center", marginTop: SPACING.md },
  busy: { opacity: 0.6 },
});
