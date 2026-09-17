import { View, Text, StyleSheet } from "react-native";

import SignedImage from "../../../../components/common/SignedImage";
import { Card } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../../themes/subjects";
import { subjectColorOf } from "../../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

export function ReviewQuestion({ item }) {
  const C = useC();
  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const color = subjectColorOf(C, subjectKey);
  const label = getSubjectByKey(subjectKey)?.name || getSubjectByKey(subjectKey)?.label || subjectKey || "";

  return (
    <View>
      <View style={styles.subjectRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[TYPOGRAPHY.label, { color, fontFamily: TYPOGRAPHY.button.fontFamily }]}>
          {label.toLocaleUpperCase("tr-TR")}
        </Text>
        <Text style={[TYPOGRAPHY.meta, styles.topic, { color: C.text3 }]} numberOfLines={1}>
          {item.topic_title || item.topic}
        </Text>
      </View>

      <View style={[styles.image, { backgroundColor: C.surface, borderColor: C.border }]}>
        {item.image_path || item.image_uri ? (
          <SignedImage
            bucket="wrong-questions"
            path={item.image_path || item.image_uri}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1, padding: STEP.s2 }}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SORU GÖRSELİ</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 4 }]}>deneme kitabından çektiğin fotoğraf</Text>
          </View>
        )}
      </View>

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
  subjectRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  topic: { flex: 1, paddingLeft: 4 },
  image: {
    height: 250, borderRadius: SHAPE.card, borderWidth: 1,
    marginTop: STEP.s3, overflow: "hidden",
  },
  note: { marginTop: STEP.s2, borderWidth: 1 },
});
