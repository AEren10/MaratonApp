import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, ErrorState, Icon, Skeleton } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { useWrongDetail } from "../../../../hooks/useWrongDetail";
import { dayMonthLocative } from "../../../../lib/trSuffix";
import { getSubjectByKey } from "../../../../themes/subjects";
import { subjectColorOf } from "../../../../themes/subjectPalette";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { WrongScreenHeader } from "../WrongScreenHeader";
import { DetailPhoto } from "./DetailPhoto";
import { ReviewLadder } from "./ReviewLadder";
import { WhyWrongCard } from "./WhyWrongCard";

// "Yanlış Detayı" artboardi (kendi sorun). "Topluluğa sor" sosyal v1 disi
// oldugu icin basilmaz; kaynak (ör. "Apotemi TYT-14") icin veri alani yok.
export function OwnWrongDetail() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const d = useWrongDetail(params);
  const item = d.item;
  const goBack = () => navigation.goBack();

  if (d.loading && !item) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        <WrongScreenHeader onPress={goBack} label="" />
        <View style={styles.loading}>
          <Skeleton height={230} radius={SHAPE.sheet} />
          <Skeleton height={14} width="30%" />
          <Skeleton height={28} width="70%" />
          <Skeleton height={120} radius={SHAPE.panel} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        <WrongScreenHeader onPress={goBack} label="" />
        <ErrorState preset="server" secondary="" onPrimary={d.load} style={styles.gutter} />
      </SafeAreaView>
    );
  }

  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const subjectLabel = getSubjectByKey(subjectKey)?.label || subjectKey || "";
  const color = subjectColorOf(C, subjectKey);
  const added = dayMonthLocative(item.created_at);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <WrongScreenHeader onPress={goBack} label="" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <DetailPhoto path={item.image_path} subjectColor={color} />

        <Animated.View entering={FadeInDown.duration(500)} style={styles.titleBlock}>
          <Text style={[TYPOGRAPHY.label, { color }]}>{subjectLabel.toLocaleUpperCase("tr")}</Text>
          <Text style={[TYPOGRAPHY.subheading, styles.topic, { color: C.text }]}>{item.topic}</Text>
          {added ? (
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 + 2 }]}>{added} eklendi</Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <WhyWrongCard note={item.note} onSave={d.saveNote} />
          <ReviewLadder item={item} />
        </Animated.View>

        <View style={styles.actions}>
          {!item.is_resolved ? (
            <Button size="lg" fullWidth loading={d.busy} onPress={d.resolve}>
              Bu soruyu kapat
            </Button>
          ) : null}
          <Pressable
            onPress={d.remove}
            accessibilityRole="button"
            accessibilityLabel="Soruyu sil"
            style={[styles.trash, { borderColor: C.border }]}
          >
            <Icon name="trash" size={16} color={C.text3} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  loading: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, gap: STEP.s3 },
  scroll: { paddingBottom: STEP.s4 + 6 },
  titleBlock: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 4 },
  topic: { marginTop: STEP.s1 + 2, maxWidth: 300 },
  actions: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6, gap: STEP.s2 - 2, alignItems: "flex-end" },
  trash: {
    width: 48,
    height: 48,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

