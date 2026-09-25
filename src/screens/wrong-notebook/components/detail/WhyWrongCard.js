import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { Button, Card } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// "NEDEN YANLIŞ YAPTIM" karti. Govde kullanicinin notu; "Düzenle" yerinde
// duzenleme acar. Hata tipi cipi (Bilgi eksiği vb.) icin veri alani yok --
// basilmaz.
export function WhyWrongCard({ note, onSave }) {
  const C = useC();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <View style={styles.wrap}>
      <Card radius="panel" style={[styles.card, { borderColor: C.elev }]}>
        <View style={styles.head}>
          <Text style={[TYPOGRAPHY.label, styles.flex, { color: C.text2 }]}>NEDEN YANLIŞ YAPTIM</Text>
          {!editing ? (
            <Press haptic="none"
              onPress={() => { setDraft(note || ""); setEditing(true); }}
              accessibilityRole="button"
              hitSlop={{ top: 14, bottom: 14, left: 12, right: 12 }}
              style={styles.edit}
            >
              <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>Düzenle</Text>
            </Press>
          ) : null}
        </View>
        {editing ? (
          <>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Bir dahaki sefere neye dikkat edeceğim…"
              placeholderTextColor={C.text3}
              multiline
              autoFocus
              accessibilityLabel="Neden yanlış yaptım"
              style={[TYPOGRAPHY.input, styles.input, { color: C.text, backgroundColor: C.void, borderColor: C.line }]}
            />
            <Button size="md" fullWidth loading={saving} onPress={submit} style={{ marginTop: STEP.s2 }}>
              Kaydet
            </Button>
          </>
        ) : (
          <Text style={[TYPOGRAPHY.body, { color: note ? C.text : C.text3, marginTop: STEP.s1 }]}>
            {note || "Bir dahaki sefere neye dikkat edeceğim…"}
          </Text>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 4 },
  card: { paddingVertical: STEP.s3 - 2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1, minHeight: CONTROL.tapMin - STEP.s2 },
  flex: { flex: 1 },
  edit: { justifyContent: "center" },
  input: {
    marginTop: STEP.s1,
    minHeight: 76,
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    textAlignVertical: "top",
  },
});
