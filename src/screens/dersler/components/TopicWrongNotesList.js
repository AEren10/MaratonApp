import { View, Text } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { TopicWrongNoteRow } from "./TopicWrongNoteRow";

export function TopicWrongNotesList({ C, items: wrongs }) {
  if (!wrongs?.length) return null;
  const items = wrongs.map((w) => ({
    id: w.id,
    raw: w,
    source: w.note?.trim() || "Not eklenmemiş",
    desc: w.dateLabel,
    badge: w.due.label,
    badgeColor: w.due.tone === "warn" ? C.warn : C.text3,
  }));

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2, marginBottom: STEP.s2 }}>
        <SectionLabel style={{ marginBottom: 0, color: C.text3 }}>DEFTERDEKİ YANLIŞLARIM</SectionLabel>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, fontSize: 13 }]}>{items.length}</Text>
      </View>
      <View style={{ gap: STEP.s2 }}>
        {items.map((item) => (
          <TopicWrongNoteRow key={item.id} item={item} C={C} />
        ))}
      </View>
    </View>
  );
}
