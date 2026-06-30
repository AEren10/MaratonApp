import { useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, Modal, FlatList, TextInput, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { getSubjectByKey } from "../../../themes/subjects";

// B) Yanlış soru konu seçici — curriculum'dan dropdown + "elle yaz" seçeneği.
// onSelect(topicName, source) → source: 'curriculum' | 'custom'
export function TopicPicker({ visible, subject, onClose, onSelect }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const topics = useMemo(() => {
    const raw = subject?.topics || getSubjectByKey(subject?.key)?.topics || [];
    return raw.map((t) => (typeof t === "string" ? t : t.name));
  }, [subject]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return topics;
    return topics.filter((t) => t.toLocaleLowerCase("tr").includes(q));
  }, [topics, query]);

  const reset = () => {
    setQuery("");
    setCustomMode(false);
    setCustomText("");
  };

  const pick = (name, source) => {
    onSelect(name, source);
    reset();
    onClose();
  };

  const renderTopicItem = useCallback(({ item }) => (
    <Pressable onPress={() => pick(item, "curriculum")} style={s.row}>
      <Text style={s.rowText}>{item}</Text>
      <Icon name="chevR" size={14} color={C.muted} />
    </Pressable>
  ), [pick, s, C.muted]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />
          <Text style={s.title}>{subject?.label || "Ders"} · Konu Seç</Text>

          {customMode ? (
            <View style={{ gap: SPACING.md }}>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder="Konu adını yaz"
                placeholderTextColor={C.muted}
                autoFocus
                style={s.input}
              />
              <Pressable
                onPress={() => customText.trim() && pick(customText.trim(), "custom")}
                style={s.primaryBtn}
              >
                <Text style={s.primaryBtnText}>Ekle</Text>
              </Pressable>
              <Pressable onPress={() => setCustomMode(false)} style={s.linkBtn}>
                <Text style={s.linkText}>Listeden seç</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={s.searchRow}>
                <Icon name="search" size={16} color={C.muted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Konu ara"
                  placeholderTextColor={C.muted}
                  style={s.searchInput}
                />
              </View>

              <FlatList
                data={filtered}
                keyExtractor={(item, i) => `${item}-${i}`}
                style={{ maxHeight: 320 }}
                keyboardShouldPersistTaps="handled"
                windowSize={5}
                maxToRenderPerBatch={10}
                renderItem={renderTopicItem}
                ListEmptyComponent={
                  <Text style={s.emptyText}>Eşleşen konu yok</Text>
                }
              />

              <Pressable onPress={() => setCustomMode(true)} style={s.customRow}>
                <Icon name="edit" size={15} color={C.accent} />
                <Text style={s.customText}>Listede yok, elle yaz</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (C) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: { ...TYPOGRAPHY.subheading, color: C.text, marginBottom: SPACING.md },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.surface2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: C.text, paddingVertical: SPACING.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  rowText: { ...TYPOGRAPHY.bodyMedium, color: C.text },
  emptyText: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center", padding: SPACING.lg },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  customText: { ...TYPOGRAPHY.bodySemiBold, color: C.accent },
  input: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body,
    color: C.text,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  primaryBtnText: { ...TYPOGRAPHY.button, color: C.bg },
  linkBtn: { alignItems: "center", paddingVertical: SPACING.sm },
  linkText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
});
