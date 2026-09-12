import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Card, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useSubscription } from "../../hooks/useSubscription";
import { useSubscriptionKeepStats } from "../../hooks/useSubscriptionKeepStats";
import { dayMonthDative, dayMonthLocative } from "../../lib/trSuffix";
import { CancelLossCard } from "./components/CancelLossCard";
import { CancelKeepCard } from "./components/CancelKeepCard";
import { CancelActions } from "./components/CancelActions";

// Tasarim: "Abonelik Iptali" -- ONAY ekrani, iptalin kendisi burada olmuyor.
// iOS/Android'de abonelik magazadan iptal edilir; ekran ne zaman duracagini
// ve neyin kaybedilecegini soyleyip magaza sayfasini aciyor.
export default function CancelSubscriptionScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { state, info, reload, openStore } = useSubscription();
  const { loading, stats } = useSubscriptionKeepStats();

  const close = useCallback(() => navigation.goBack(), [navigation]);
  const endsDative = dayMonthDative(info?.endsAt);
  const endsLocative = dayMonthLocative(info?.endsAt);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.closeBtn}
        >
          <Icon name="x" size={14} color={C.text2} />
        </Pressable>
      </View>

      {state === "loading" ? (
        <View style={styles.body}>
          <Skeleton height={120} radius={SHAPE.sheet} />
        </View>
      ) : null}

      {state !== "loading" && !endsDative ? (
        <ErrorState preset="server" onPrimary={reload} onSecondary={close} style={styles.body} />
      ) : null}

      {state !== "loading" && endsDative ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(420)}>
            <Text style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>
              {`Premium ${endsDative} kadar açık.`}
            </Text>
            <Text style={[TYPOGRAPHY.caption, styles.lede, { color: C.text3 }]}>
              İptal edersen o güne kadar her şey çalışır. Sonrasında ücretsiz plana dönersin.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(420)} style={styles.block}>
            <CancelLossCard dateLabel={endsLocative.toLocaleUpperCase("tr-TR")} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(420)} style={styles.blockTight}>
            <CancelKeepCard loading={loading} stats={stats} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(420)} style={styles.block}>
            <Card tone="surface" radius="panel" style={[styles.note, { borderColor: C.elev }]}>
              <View style={[styles.dot, { backgroundColor: C.down }]} />
              <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]}>
                {`Ödeme ${info.storeName} üzerinden yapıldığı için iptal orada da onaylanmalı.`}
              </Text>
            </Card>
          </Animated.View>

          <View style={styles.actions}>
            <CancelActions onKeep={close} onConfirm={openStore} />
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER - 10 },
  closeBtn: {
    width: CONTROL.tapMin, height: CONTROL.tapMin,
    alignItems: "center", justifyContent: "center",
  },
  body: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s5 },
  title: { maxWidth: 300, marginTop: STEP.s3 },
  lede: { marginTop: STEP.s2 + 2, maxWidth: 306, lineHeight: 22 },
  block: { marginTop: STEP.s4 - 4 },
  blockTight: { marginTop: STEP.s2 },
  note: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 16, paddingHorizontal: 18 },
  dot: { width: 6, height: 6, borderRadius: 1 },
  actions: { marginTop: STEP.s4 - 4 },
});
