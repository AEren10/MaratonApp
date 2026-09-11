import { View, Text } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Ders cipi (nokta + buyuk harf ad) ve altinda konu basligi.
export function TopicHeroHeader({ subjectName, color, topicName }) {
  const C = useC();
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 + 1 }}>
        <View style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: color }} />
        <Text style={[TYPOGRAPHY.label, { color, marginBottom: 0 }]}>
          {(subjectName || "").toUpperCase()}
        </Text>
      </View>
      <Text
        style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s2, maxWidth: 300 }]}
        numberOfLines={3}
      >
        {topicName}
      </Text>
    </View>
  );
}
