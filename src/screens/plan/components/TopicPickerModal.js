import { useState, useMemo } from "react";
import {
  Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function TopicPickerModal({ visible, onClose, onSelect, subjectLabel, topics = [], C }) {
  const [query, setQuery] = useState("");

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return topics;
    const q = query.toLocaleLowerCase("tr");
    return topics.filter((t) => t.toLocaleLowerCase("tr").includes(q));
  }, [topics, query]);

  const handlePick = (t) => {
    H.select();
    onSelect(t);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[s.overlay, { backgroundColor: C.void + "CC" }]}
      >
        <SafeAreaView edges={["bottom"]} style={[s.sheet, { backgroundColor: C.bg, borderColor: C.line }]}>
          <View style={[s.header, { borderBottomColor: C.line }]}>
            <View style={{ flex: 1 }}>
              <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Konu Seç</Text>
              {subjectLabel ? <Text style={[TYPOGRAPHY.meta, { color: C.accent }]}>{subjectLabel}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={STEP.s2}>
              <Icon name="x" size={20} color={C.text2} />
            </Pressable>
          </View>

          <View style={[s.searchWrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <Icon name="search" size={16} color={C.text3} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Konularda ara veya yeni konu yaz..."
              placeholderTextColor={C.text3}
              style={[TYPOGRAPHY.input, s.input, { color: C.text, paddingVertical: 0 }]}
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Icon name="x" size={14} color={C.text3} />
              </Pressable>
            ) : null}
          </View>

          {query.trim() && !topics.includes(query.trim()) ? (
            <Pressable
              onPress={() => handlePick(query.trim())}
              style={[s.customRow, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}
            >
              <Icon name="plus" size={16} color={C.accent} />
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accent, flex: 1 }]}>
                Özel ekle: "{query.trim()}"
              </Text>
            </Pressable>
          ) : null}

          <FlatList
            data={filteredTopics}
            keyExtractor={(item, i) => `${item}_${i}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePick(item)}
                style={({ pressed }) => [
                  s.item,
                  { borderBottomColor: C.line, backgroundColor: pressed ? C.surface : "transparent" },
                ]}
              >
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{item}</Text>
                <Icon name="chevR" size={14} color={C.text3} />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>Eşleşen konu bulunamadı.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: { height: "75%", borderTopLeftRadius: SHAPE.sheet, borderTopRightRadius: SHAPE.sheet, borderTopWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s3, borderBottomWidth: 1 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, marginHorizontal: GUTTER,
    marginTop: STEP.s3, paddingHorizontal: STEP.s3, height: 48, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  input: { flex: 1 },
  customRow: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, marginHorizontal: GUTTER,
    marginTop: STEP.s2, paddingHorizontal: STEP.s3, height: 44, borderRadius: SHAPE.cardTight, borderWidth: 1,
  },
  list: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: STEP.s3, borderBottomWidth: 1 },
  empty: { paddingVertical: STEP.s5, alignItems: "center" },
});
