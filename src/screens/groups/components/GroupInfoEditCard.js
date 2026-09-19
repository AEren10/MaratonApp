import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupInfoEditCard({
  name,
  code,
  isAdmin,
  onSaveName,
  onRegenerateCode,
  busy,
}) {
  const C = useC();
  const [editing, setEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name || "");

  const handleSave = () => {
    if (currentName.trim().length >= 3) {
      H.success();
      onSaveName?.(currentName.trim());
      setEditing(false);
    } else {
      H.warn();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={[styles.label, { color: C.text3 }]}>GRUP BİLGİLERİ</Text>

      <View style={styles.fieldRow}>
        <View style={styles.flex}>
          <Text style={[styles.fieldLabel, { color: C.text3 }]}>Grup Adı</Text>
          {editing ? (
            <TextInput
              value={currentName}
              onChangeText={setCurrentName}
              style={[styles.nameInput, { color: C.text, backgroundColor: C.void, borderColor: C.line }]}
              maxLength={30}
              autoFocus
            />
          ) : (
            <Text style={[styles.nameValue, { color: C.text }]}>{currentName}</Text>
          )}
        </View>

        {isAdmin ? (
          <Pressable
            accessibilityRole="button"
            onPress={editing ? handleSave : () => setEditing(true)}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: C.elev, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Icon name={editing ? "check" : "edit"} size={16} color={C.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.fieldRow, styles.topBorder, { borderTopColor: C.line }]}>
        <View style={styles.flex}>
          <Text style={[styles.fieldLabel, { color: C.text3 }]}>Katılım Kodu</Text>
          <Text style={[styles.codeValue, { color: C.text }]}>{code || "---"}</Text>
        </View>

        {isAdmin ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kodu yenile"
            disabled={busy}
            onPress={() => {
              H.tap();
              onRegenerateCode?.();
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: C.elev, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Icon name="refresh" size={16} color={C.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3, marginBottom: STEP.s3 },
  label: { ...TYPOGRAPHY.label, marginBottom: STEP.s2 },
  fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: SHAPE.chip },
  topBorder: { borderTopWidth: 1, marginTop: STEP.s1, paddingTop: STEP.s1 },
  flex: { flex: 1 },
  fieldLabel: { ...TYPOGRAPHY.micro, marginBottom: SPACING.xs / 2 },
  nameValue: { ...TYPOGRAPHY.bodyMedium },
  nameInput: {
    ...TYPOGRAPHY.bodyMedium,
    borderWidth: 1,
    borderRadius: SHAPE.chip,
    paddingHorizontal: STEP.s1,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs / 2,
  },
  codeValue: { ...TYPOGRAPHY.topicName, letterSpacing: 2 },
  actionBtn: { width: 36, height: 36, borderRadius: SHAPE.chip, alignItems: "center", justifyContent: "center", marginLeft: STEP.s2 },
});
