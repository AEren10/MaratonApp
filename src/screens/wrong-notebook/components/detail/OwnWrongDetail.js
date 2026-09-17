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
import { useAlert } from "../../../../contexts/AlertContext";

export function OwnWrongDetail() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const d = useWrongDetail(params);
  const item = d.item;
  const goBack = () => navigation.goBack();
  const showAlert = useAlert();

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

  const sInfo = getSubjectByKey(item.subject);
  const subjectName = sInfo?.name || item.subject;
  const sColor = subjectColorOf(C, item.subject);
  const meta = [item.source_title, dayMonthLocative(item.created_at, "da eklendi")].filter(Boolean).join(" · ");

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <WrongScreenHeader
        onPress={goBack}
        label="YANLIŞ DETAYI"
        right={<Icon name="moreH" size={16} color={C.text3} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <DetailPhoto uri={item.image_uri} subjectColor={sColor} />
          <View style={styles.titleBlock}>
            <Text style={[TYPOGRAPHY.label, { color: sColor, letterSpacing: 1.5 }]}>
              {subjectName.toLocaleUpperCase("tr-TR")}
            </Text>
            <Text style={[TYPOGRAPHY.subheading, styles.topic, { color: C.text }]}>{item.topic_title}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 + 2 }]}>{meta}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(400)}>
          <WhyWrongCard item={item} />
          <ReviewLadder item={item} />
        </Animated.View>

        <View style={styles.actions}>
          {!item.is_resolved ? (
            <Button size="lg" fullWidth loading={d.busy} onPress={d.resolve} style={{ marginBottom: STEP.s2 }}>
              Bu soruyu kapat
            </Button>
          ) : null}
          <View style={styles.actionRow}>
            <Button 
              size="lg" 
              variant="outline" 
              style={{ flex: 1 }} 
              onPress={() => showAlert("Yakında", "Topluluğa sor özelliği henüz aktif değil.")}
            >
              Topluluğa sor
            </Button>
            <Pressable
              onPress={d.remove}
              accessibilityRole="button"
              accessibilityLabel="Soruyu sil"
              style={[styles.trash, { borderColor: C.border }]}
            >
              <Icon name="trash" size={16} color={C.text3} />
            </Pressable>
          </View>
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
  actions: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6 },
  actionRow: { flexDirection: "row", gap: STEP.s2 },
  trash: {
    width: 48,
    height: 48,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
