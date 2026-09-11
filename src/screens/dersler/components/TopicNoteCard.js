import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon, Card } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { getTopicNote, saveTopicNote } from "../../../supabase/topicNotes";

// Konuya özel kalıcı not (DB'de saklanır).
export function TopicNoteCard({ subjectKey, topicName }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev" || !subjectKey || !topicName) return;
    let cancelled = false;
    getTopicNote(user.id, subjectKey, topicName)
      .then((c) => { if (!cancelled) { setNote(c); setSaved(c); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, subjectKey, topicName]);

  const save = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    setSaving(true);
    setSaveError(false);
    try {
      await saveTopicNote(user.id, subjectKey, topicName, note);
      setSaved(note);
    } catch (_) {
      setSaveError(true);
    }
    setSaving(false);
  }, [user?.id, subjectKey, topicName, note]);

  const dirty = note !== saved;

  return (
    <Card tone="surface" radius="cardTight" style={s.card}>
      <View style={s.head}>
        <Icon name="edit" size={15} color={C.accent} />
        <Text style={s.title}>Konu Notum</Text>
        {saveError ? (
          <Text style={{ ...TYPOGRAPHY.micro, color: C.danger }}>Kaydedilemedi</Text>
        ) : null}
        {dirty ? (
          <Pressable
            onPress={save}
            disabled={saving}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Notu kaydet"
            style={s.saveBtn}
          >
            <Text style={s.saveText}>{saving ? "..." : "Kaydet"}</Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Bu konuda dikkat edeceklerin, formüller, ipuçları..."
        placeholderTextColor={C.text3}
        multiline
        style={s.input}
      />
    </Card>
  );
}

const makeStyles = (C) => StyleSheet.create({
  card: { marginTop: STEP.s2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginBottom: STEP.s1 },
  title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  // Kaydet: kucuk ogede dokunma alani seffaf dolguyla 44px'e cikarilir,
  // gorsel boyut korunur (AGENTS.md).
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: SHAPE.chip,
    paddingHorizontal: STEP.s2,
    minHeight: 28,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { ...TYPOGRAPHY.micro, color: C.accentInk },
  input: { ...TYPOGRAPHY.body, color: C.text, minHeight: 80, textAlignVertical: "top" },
});
