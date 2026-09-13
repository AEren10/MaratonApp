import { View, Text, StyleSheet } from "react-native";

import SignedImage from "../../../../components/common/SignedImage";
import { Card } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../../themes/subjects";
import { subjectColorOf } from "../../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Tekrar kartinin govdesi: ders + konu satiri, soru fotografi, kullanicinin
// "neden yanlis yaptim" notu. Fotograf ya da not yoksa o blok basilmaz.
export function ReviewQuestion({ item }) {
  const C = useC();
  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const color = subjectColorOf(C, subjectKey);
  const label = getSubjectByKey(subjectKey)?.label || subjectKey || "";

  return (
    <View>
      <View style={styles.subjectRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[TYPOGRAPHY.label, { color, fontFamily: TYPOGRAPHY.button.fontFamily }]}>
          {label.toLocaleUpperCase("tr")}
        </Text>
        <Text style={[TYPOGRAPHY.meta, styles.topic, { color: C.text3 }]} numberOfLines={1}>
          {item.topic}
        </Text>
      </View>

      {item.image_path ? (
        <View style={[styles.image, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SignedImage
            bucket="wrong-questions"
            path={item.image_path}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </View>
      ) : null}

      {item.note ? (
        <Card radius="sheet" style={[styles.note, { borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>NEDEN YANLIŞ YAPTIM</Text>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text, marginTop: STEP.s1 }]}>{item.note}</Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subjectRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 1 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  topic: { flex: 1 },
  image: {
    marginTop: STEP.s2 + 4,
    height: 250,
    borderRadius: SHAPE.sheet - 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  note: { marginTop: STEP.s3 + 2, paddingVertical: STEP.s3 - 2 },
});
