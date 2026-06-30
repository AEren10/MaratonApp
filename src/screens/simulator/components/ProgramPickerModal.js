import React, { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, Modal, FlatList, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, COLORS } from "../../../themes/tokens";
import { PROGRAM_CATEGORIES, searchPrograms } from "../../../data/programs";
import ProgramRow from "./ProgramRow";

const progKeyExtractor = (item) => item.id;
const ProgEmpty = <View style={{ padding: 24, alignItems: "center" }}><Text style={{ color: COLORS.dark.textMuted }}>Sonuç bulunamadı</Text></View>;

export default function ProgramPickerModal({ visible, onClose, onSelect, type, C }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);

  const filtered = useMemo(() => searchPrograms(query, { type, category }), [query, type, category]);
  const renderItem = useCallback(({ item }) => <ProgramRow item={item} onSelect={onSelect} C={C} />, [onSelect, C]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={[styles.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <Text style={[styles.title, { color: C.text }]}>Hedef Bölüm Seç</Text>

            <View style={[styles.searchBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
              <Icon name="search" size={16} color={C.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Bölüm veya üniversite ara" placeholderTextColor={C.muted} style={[styles.searchInput, { color: C.text }]} />
              {query.length > 0 && <Pressable onPress={() => setQuery("")} hitSlop={8}><Icon name="x" size={14} color={C.muted} /></Pressable>}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", gap: 6, paddingRight: 16 }}>
                <Pressable onPress={() => setCategory(null)} style={[styles.chip, { backgroundColor: !category ? C.accent : C.surface2, borderColor: !category ? C.accent : C.border }]}>
                  <Text style={[styles.chipText, { color: !category ? C.textOnFill : C.sec }]}>Tümü</Text>
                </Pressable>
                {PROGRAM_CATEGORIES.map((cat) => {
                  const active = category === cat.id;
                  const color = C[cat.color] || C.purple;
                  return (
                    <Pressable key={cat.id} onPress={() => setCategory(active ? null : cat.id)} style={[styles.chip, { backgroundColor: active ? color : color + "12", borderColor: active ? color : color + "30" }]}>
                      <Icon name={cat.icon} size={11} color={active ? C.textOnFill : color} />
                      <Text style={[styles.chipText, { color: active ? C.textOnFill : color }]}>{cat.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <FlatList data={filtered} keyExtractor={progKeyExtractor} style={{ marginTop: 8, maxHeight: 380 }} keyboardShouldPersistTaps="handled" windowSize={5} maxToRenderPerBatch={10} ListEmptyComponent={ProgEmpty} renderItem={renderItem} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.subheading, marginBottom: 14 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  searchInput: { ...TYPOGRAPHY.body, flex: 1, paddingVertical: 0 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipText: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold" },
});
