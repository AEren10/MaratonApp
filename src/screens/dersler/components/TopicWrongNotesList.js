import { View, Text } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { TopicWrongNoteRow } from "./TopicWrongNoteRow";

// Bu konudaki cozulmemis yanlislar. Bos ise bolum hic gosterilmiyor.
export function TopicWrongNotesList({ items }) {
  const C = useC();
  if (!items.length) return null;

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s2 }}>
        <SectionLabel style={{ marginBottom: 0 }}>DEFTERDEKİ YANLIŞLARIM</SectionLabel>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Text style={[TYPOGRAPHY.topicName, { color: C.text3, fontSize: 15 }]}>{items.length}</Text>
      </View>
      {items.map((item) => (
        <TopicWrongNoteRow key={item.id} item={item} />
      ))}
    </View>
  );
}
