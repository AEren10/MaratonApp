import { View, Text } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { TopicWrongNoteRow } from "./TopicWrongNoteRow";

export function TopicWrongNotesList({ C, data, subjectKey }) {
  // Tasarım (Image 2) verilerini sağlama:
  const items = [
    { id: 1, source: "Tekrarlı permütasyonda bölmeyi unuttum", desc: "23 Haz · TYT denemesi", badge: "BUGÜN", badgeColor: C.warn },
    { id: 2, source: "Dairesel dizilişte (n-1)! kuralı", desc: "21 Haz · konu testi", badge: "2 GÜN", badgeColor: C.text3 },
    { id: 3, source: "Yan yana gelmeme koşulu", desc: "18 Haz · TYT denemesi", badge: "5 GÜN", badgeColor: C.text3 },
  ];

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2, marginBottom: STEP.s2 }}>
        <SectionLabel style={{ marginBottom: 0, color: C.text3 }}>DEFTERDEKİ YANLIŞLARIM</SectionLabel>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, fontSize: 13 }]}>5</Text>
      </View>
      <View style={{ gap: STEP.s2 }}>
        {items.map((item) => (
          <TopicWrongNoteRow key={item.id} item={item} C={C} />
        ))}
      </View>
    </View>
  );
}
