import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Card, Icon, SectionLabel, StatBlock } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { STEP, SHAPE, TYPOGRAPHY } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";

// "Tekrar Bitti" kapanış ekranı. Sayılar navigation route.params'tan gelir —
// ReviewSessionScreen bu ekrana geçerken gerçek oturum verisini taşımalı.
// Eksik alan varsa o blok basılmaz, uydurma değer YOK.
export default function ReviewDoneScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const {
    reviewedCount,
    closedCount,
    rememberedCount,
    forgotCount,
    pendingBefore,
    pendingAfter,
    nextReviewDays,
    queuedCount,
  } = params || {};

  // Cevrimdisi yapilan tekrar sunucuya ulasmadiysa kullanici bunu GORMELI.
  // Eski bitis ekraninda bu uyari vardi, yeni ekrana tasindi — kod yorumu
  // "eskiden kosulsuz 'Araliklar guncellendi' yaziyordu, cevrimdisi tekrarin
  // tamami kaybolmusken bile" diyordu, o regresyona geri donmeyelim.
  const offlineNote = Number.isFinite(queuedCount) && queuedCount > 0
    ? `${queuedCount} sonuç çevrimdışı kaydedildi, bağlantı gelince gönderilecek.`
    : null;

  const hasGradeSplit = Number.isFinite(rememberedCount) && Number.isFinite(forgotCount);
  const hasPending = Number.isFinite(pendingBefore) && Number.isFinite(pendingAfter);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: C.success + "1A" }]}>
            <Icon name="checkCircle" size={22} color={C.success} />
          </View>
          <SectionLabel>TEKRAR BİTTİ</SectionLabel>
          {Number.isFinite(reviewedCount) ? (
            <StatBlock size="hero" value={String(reviewedCount)} unit="soru tekrar edildi" />
          ) : null}
        </Animated.View>

        {hasGradeSplit ? (
          <Animated.View entering={FadeInDown.delay(80).duration(500)}>
            {offlineNote ? (
              <Text style={[TYPOGRAPHY.caption, { color: C.warn }]}>{offlineNote}</Text>
            ) : null}

            <Card style={styles.gradeRow}>
              <View style={styles.gradeCol}>
                <StatBlock size="large" value={String(rememberedCount)} color={C.success} />
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİLDİM</Text>
                <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>aralık uzadı</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: C.border }]} />
              <View style={styles.gradeCol}>
                <StatBlock size="large" value={String(forgotCount)} color={C.warn} />
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİLEMEDİM</Text>
                <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>yarın tekrar</Text>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {Number.isFinite(closedCount) && closedCount > 0 ? (
          <Animated.View entering={FadeInDown.delay(140).duration(500)}>
            <Card>
              <StatBlock size="value" value={String(closedCount)} unit="soru kapandı" />
              <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>
                Bugünkü emeğin kayda geçti. Bir sonraki denemeye daha hazırlıklı gidiyorsun.
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        {hasPending ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <SectionLabel>DEFTER DURUMU</SectionLabel>
            <Card style={styles.pendingRow}>
              <Text style={[TYPOGRAPHY.body, { color: C.text }]}>
                {pendingBefore} → {pendingAfter} bekliyor
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        {Number.isFinite(nextReviewDays) ? (
          <Text style={[TYPOGRAPHY.caption, styles.footnote, { color: C.text3 }]}>
            Tekrar kayda geçti. Bu konu {nextReviewDays} gün sonra tekrar önerilecek.
          </Text>
        ) : null}
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: C.border }]}>
        <Button
          variant="outline"
          onPress={() => {
            haptic.tap();
            navigation.navigate(SCREENS.WRONG_NOTEBOOK);
          }}
          style={styles.actionBtn}
          accessibilityLabel="Deftere dön"
        >
          Deftere dön
        </Button>
        <Button
          onPress={() => {
            haptic.select();
            navigation.navigate(SCREENS.ROADMAP);
          }}
          style={styles.actionBtn}
          accessibilityLabel="Çalışmaya başla, sıradaki durak"
        >
          Çalışmaya başla · sıradaki durak
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: STEP.s3, gap: STEP.s3 },
  hero: { alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s3 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeRow: { flexDirection: "row", alignItems: "center" },
  gradeCol: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, alignSelf: "stretch", marginHorizontal: STEP.s2 },
  pendingRow: { alignItems: "center" },
  footnote: { textAlign: "center", paddingHorizontal: STEP.s2 },
  actions: { borderTopWidth: 1, padding: STEP.s3, gap: STEP.s2 },
  actionBtn: { width: "100%" },
});
