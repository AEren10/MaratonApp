import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { TopicWrongNoteRow } from "./TopicWrongNoteRow";

export function TopicWrongNotesList({ C, items: wrongs = [], onAllPress }) {
  if (!wrongs?.length) return null;

  const displayItems = wrongs.slice(0, 3).map((w) => ({
    id: w.id,
    raw: w,
    source: w.note?.trim() || "Not eklenmemiş",
    desc: w.dateLabel,
    badge: w.due.label,
    badgeColor: w.due.tone === "warn" ? C.warn : C.text3,
  }));

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <SectionLabel style={s.label}>DEFTERDEKİ YANLIŞLARIM</SectionLabel>
        <View style={[s.divider, { backgroundColor: C.line }]} />
        {onAllPress ? (
          <Press
            onPress={onAllPress}
            accessibilityRole="button"
            accessibilityLabel="Defterdeki tüm yanlışları göster"
            style={s.allBtn}
          >
            <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>TÜMÜ</Text>
            <Icon name="chevR" size={12} color={C.accentBright} />
          </Press>
        ) : (
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text3 }]}>{wrongs.length}</Text>
        )}
      </View>

      <View style={s.list}>
        {displayItems.map((item) => (
          <TopicWrongNoteRow key={item.id} item={item} C={C} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginBottom: STEP.s2,
  },
  label: {
    marginBottom: STEP.s1 - STEP.s1,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  allBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 4,
    paddingVertical: STEP.s1 / 2,
    paddingLeft: STEP.s1,
  },
  list: {
    gap: STEP.s2,
  },
});
