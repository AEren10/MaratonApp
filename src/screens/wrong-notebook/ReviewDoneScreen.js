import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button, Card, Icon, Press } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { ReviewDoneMetrics } from "./components/ReviewDoneMetrics";
import { useC } from "../../contexts/ThemeContext";
import { STEP, SHAPE, TYPOGRAPHY, GUTTER, CONTROL } from "../../themes/tokens";
import { alpha } from "../../themes/palette";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import * as haptic from "../../lib/haptics";

function ReviewDoneContent() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  
  // Yalniz oturumun gercek sayilari (useWrongReviewSession). Eskiden
  // parametre gelmezse 6/2/4/2/14/12 uyduruluyor, metinde sabit "Yarın 4
  // soru" ve "9 gün sonra" yaziyordu.
  const reviewedCount = params?.reviewedCount ?? 0;
  const closedCount = params?.closedCount ?? 0;
  const rememberedCount = params?.rememberedCount ?? 0;
  const forgotCount = params?.forgotCount ?? 0;
  const pendingBefore = params?.pendingBefore ?? 0;
  const pendingAfter = params?.pendingAfter ?? 0;
  const resolvedShare = pendingBefore > 0 ? (pendingBefore - pendingAfter) / pendingBefore : 0;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.topBar}>
        <Press
          haptic="none"
          hitSlop={12}
          onPress={() => navigation.navigate(SCREENS.WRONG_NOTEBOOK)}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.closeBtn}
        >
          <Icon name="x" size={18} color={C.text2} />
        </Press>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 1.5 }]}>TEKRAR BİTTİ</Text>
          
          <View style={styles.heroTitleRow}>
            <Text style={[TYPOGRAPHY.statLarge, { color: C.text, fontSize: 64, lineHeight: 64 }]}>{reviewedCount}</Text>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginTop: 12 }]}>soru tekrar edildi</Text>
          </View>
          
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s3 }]}>
            Bildiğin {rememberedCount} sorunun aralığı uzadı.{" "}
            {forgotCount > 0 ? `Bilemediğin ${forgotCount} soru yarın yeniden karşına çıkacak.` : "Bilemediğin soru yok."}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          {closedCount > 0 ? (
            <View style={[styles.closedRow, { backgroundColor: alpha(C.text2, 10), borderColor: alpha(C.text2, 25) }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 }}>
                <Icon name="checkCircle" size={18} color={C.text2} />
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{closedCount} soru kapandı</Text>
              </View>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>defterde <Text style={{ color: C.text, fontFamily: "Archivo_600" }}>{pendingBefore}</Text></Text>
            </View>
          ) : null}

          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s2 }]}>
            Bugünkü emeğin kayda geçti. Bir sonraki denemeye daha hazırlıklı gidiyorsun.
          </Text>
        </Animated.View>

        <ReviewDoneMetrics
          C={C}
          rememberedCount={rememberedCount}
          forgotCount={forgotCount}
          pendingBefore={pendingBefore}
          pendingAfter={pendingAfter}
          resolvedShare={resolvedShare}
        />

        <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.actions}>
          <Button
            size="lg"
            onPress={() => {
              haptic.tap();
              navigation.navigate(SCREENS.WRONG_NOTEBOOK);
            }}
            style={styles.actionBtn}
          >
            Deftere dön
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => {
              haptic.select();
              openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME);
            }}
            style={styles.actionBtn}
          >
            Çalışmaya başla · sıradaki durak
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ReviewDoneScreen() {
  return (
    <ScreenErrorBoundary>
      <ReviewDoneContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { paddingHorizontal: GUTTER, paddingTop: STEP.s1, alignItems: "flex-end" },
  closeBtn: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  scroll: { padding: GUTTER, paddingTop: STEP.s1 },
  hero: { marginBottom: STEP.s3 },
  heroTitleRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s2 },
  closedRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1, marginTop: STEP.s2,
  },
  actions: { marginTop: STEP.s4, gap: STEP.s2, paddingBottom: STEP.s4 },
  actionBtn: { width: "100%" },
});
