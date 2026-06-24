import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon, GlassCard } from "../../../components/design";
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
    <GlassCard radius={RADIUS.lg} style={s.card}>
      <View style={s.head}>
        <Icon name="edit" size={15} color={C.accent} />
        <Text style={s.title}>Konu Notum</Text>
        {saveError ? (
          <Text style={{ ...TYPOGRAPHY.micro, color: C.danger }}>Kaydedilemedi</Text>
        ) : null}
        {dirty ? (
          <Pressable onPress={save} disabled={saving} style={s.saveBtn}>
            <Text style={s.saveText}>{saving ? "..." : "Kaydet"}</Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Bu konuda dikkat edeceklerin, formüller, ipuçları..."
        placeholderTextColor={C.muted}
        multiline
        style={s.input}
      />
    </GlassCard>
  );
}

const makeStyles = (C) => StyleSheet.create({
  card: { padding: SPACING.md, marginTop: SPACING.md },
  head: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  saveBtn: { backgroundColor: C.accent, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  saveText: { ...TYPOGRAPHY.micro, color: C.bg },
  input: { ...TYPOGRAPHY.body, color: C.text, minHeight: 80, textAlignVertical: "top" },
});
