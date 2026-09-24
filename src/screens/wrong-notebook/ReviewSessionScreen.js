import { useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button, ErrorState, Skeleton } from "../../components/design";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useWrongReviewSession } from "../../hooks/useWrongReviewSession";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { reviewStatus } from "./components/review/reviewCopy";
import { ReviewPendingPanel } from "./components/review/ReviewPendingPanel";
import { ReviewProgress } from "./components/review/ReviewProgress";
import { ReviewQuestion } from "./components/review/ReviewQuestion";
import { WrongScreenHeader } from "./components/WrongScreenHeader";

// Eski rota adlari ayni ekrana baglanir; derin baglanti ve eski girisler
// kirilmaz. Hizli Pratik: defterden karisik 5 soru.
const ROUTE_DEFAULTS = {
  [SCREENS.QUICK_PRACTICE]: { limit: 5, shuffle: true, source: "quick_practice" },
  [SCREENS.SWIPE_REVIEW]: { source: "swipe_review" },
};

// "Tekrar" artboardi. Bitis "Tekrar Bitti" ekranina replace ile gecer.
export default function ReviewSessionScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const opts = useMemo(() => ({ ...ROUTE_DEFAULTS[route.name], ...route.params }), [route.name, route.params]);
  const s = useWrongReviewSession(opts);
  const close = () => navigation.goBack();

  // Tekrar gunu gelen soru yoksa bos seans gosterilmez: deftere donulur,
  // defter kendi halini (bos / liste) zaten gosteriyor.
  const nothingDue = !s.loading && !s.failed && s.total === 0;
  useEffect(() => {
    if (!nothingDue) return;
    const { routes = [], index = 0 } = navigation.getState?.() || {};
    if (routes[index - 1]?.name === SCREENS.WRONG_NOTEBOOK) navigation.goBack();
    else navigation.replace(SCREENS.WRONG_NOTEBOOK);
  }, [nothingDue, navigation]);

  const header = (
    <WrongScreenHeader
      icon="x"
      label="TEKRAR"
      onPress={close}
      right={s.total ? (
        <Text style={[TYPOGRAPHY.micro, styles.counter, { color: C.text3 }]}>
          {Math.min(s.idx + 1, s.total)} / {s.total}
        </Text>
      ) : null}
    />
  );

  if (s.loading || nothingDue) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        {header}
        <View style={styles.loading}>
          <Skeleton height={3} />
          <Skeleton height={14} width="60%" />
          <Skeleton height={250} radius={SHAPE.sheet} />
          <Skeleton height={80} radius={SHAPE.sheet} />
        </View>
      </SafeAreaView>
    );
  }

  if (s.failed || !s.current) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        {header}
        <ErrorState preset="server" secondary="" onPrimary={s.load} style={styles.gutter} />
      </SafeAreaView>
    );
  }

  const status = reviewStatus(s.current, s.answer, C);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      {header}
      <ReviewProgress index={s.idx} total={s.total} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View key={s.current.id} style={styles.question}>
          <ReviewQuestion item={s.current} />
        </Animated.View>

        <View style={styles.panel}>
          <ReviewPendingPanel before={s.pendingStart} now={s.pendingNow} status={status} />
        </View>
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: C.line, backgroundColor: C.bg }]}>
        <View style={styles.actions}>
          <Button variant="outline" size="lg" onPress={() => s.grade(false)} style={styles.flex} accessibilityLabel="Bilemedim">
            Bilemedim
          </Button>
          <Button size="lg" onPress={() => s.grade(true)} style={styles.flex} accessibilityLabel="Bildim">
            Bildim
          </Button>
        </View>
        <Animated.Text
          key={status.hint}
          entering={FadeIn.duration(500)}
          style={[TYPOGRAPHY.meta, styles.hint, { color: C.text3 }]}
        >
          {status.hint}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  counter: { fontVariant: ["tabular-nums"] },
  loading: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, gap: STEP.s3 },
  scroll: { paddingBottom: STEP.s4 },
  question: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - 6 },
  panel: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2 },
  // Kucuk Ekran kurali: Bildim/Bilemedim icerikle kaymaz, alt seritte.
  footer: { borderTopWidth: 1, paddingTop: STEP.s2, paddingBottom: STEP.s1 },
  actions: { flexDirection: "row", gap: STEP.s2, paddingHorizontal: GUTTER },
  flex: { flex: 1 },
  hint: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 + 2 },
});
