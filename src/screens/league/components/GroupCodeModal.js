import React from "react";
import { View, Text, Pressable, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, SPACING, STEP, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function GroupCodeModal({ visible, title, subtitle, placeholder, value, onChange, onSubmit, onClose, busy, cta, autoCap, maxLen, error }) {
  const C = useC();
  const isCode = autoCap && maxLen === 6;
  const disabled = busy || !value?.trim() || (isCode && value.trim().length < 4);

  const handleSubmit = () => {
    if (disabled) return;
    H.medium();
    onSubmit?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flex}>
        <Pressable style={s.backdrop} onPress={onClose}>
          <Pressable accessibilityViewIsModal style={[s.dialog, { backgroundColor: C.surface, borderColor: C.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={s.topRow}>
              <View style={[s.iconBadge, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
                <Icon name={isCode ? "users" : "plus"} size={18} color={C.accent} />
              </View>
              <Press haptic="none" onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={s.closeBtn}>
                <Icon name="x" size={18} color={C.text3} />
              </Press>
            </View>

            <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>{title}</Text>
            <Text style={[TYPOGRAPHY.caption, s.subtitle, { color: C.sec }]}>
              {subtitle || (isCode ? "Arkadaşından aldığın 6 haneli kodu gir." : "Grubun için bir isim belirle.")}
            </Text>

            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={C.muted}
              autoCapitalize={autoCap ? "characters" : "none"}
              maxLength={maxLen}
              autoFocus
              style={[
                s.input,
                isCode && s.codeInput,
                {
                  backgroundColor: C.bg,
                  borderColor: error ? C.danger : C.border,
                  color: isCode ? (error ? C.danger : C.accent) : C.text,
                },
              ]}
            />

            {error ? (
              <View style={[s.errorBox, { backgroundColor: C.danger + "14", borderColor: C.danger + "35" }]}>
                <Icon name="alertCircle" size={15} color={C.danger} />
                <Text style={[TYPOGRAPHY.caption, s.errorText, { color: C.danger }]}>{error}</Text>
              </View>
            ) : null}

            <Press haptic="none" onPress={handleSubmit} disabled={disabled} accessibilityRole="button" style={[s.submit, { backgroundColor: disabled ? C.surface2 : C.accent }]}>
              {busy ? <ActivityIndicator size="small" color={C.textOnFill} /> : <Text style={[TYPOGRAPHY.button, { color: disabled ? C.text3 : C.textOnFill }]}>{cta}</Text>}
            </Press>

            <Press haptic="none" onPress={onClose} hitSlop={8} accessibilityRole="button" style={s.cancelBtn}>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Vazgeç</Text>
            </Press>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.xl },
  dialog: { width: "100%", maxWidth: 360, borderRadius: RADIUS.xxl, padding: SPACING.xl, borderWidth: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBadge: { width: 38, height: 38, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  closeBtn: { padding: SPACING.xs },
  title: { marginTop: SPACING.md },
  subtitle: { marginTop: SPACING.xs, marginBottom: SPACING.md },
  input: { borderWidth: 1, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: STEP.s2, ...TYPOGRAPHY.input },
  codeInput: { ...TYPOGRAPHY.inputHeading, letterSpacing: 4, textAlign: "center", paddingVertical: STEP.s2 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: STEP.s1 + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  errorText: { flex: 1 },
  submit: { minHeight: 48, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", marginTop: SPACING.md },
  cancelBtn: { minHeight: 38, alignItems: "center", justifyContent: "center", marginTop: SPACING.xs },
});
