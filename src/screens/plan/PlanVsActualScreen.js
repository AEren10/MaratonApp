import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card, Button, EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { usePlanVsActual } from "../../hooks/usePlanVsActual";
import { PlanVsActualChart } from "./components/PlanVsActualChart";

function CountCard({ C, eyebrow, value, caption, accent }) {
  return (
    <Card
      tone={accent ? "tint" : "surface"}
      radius="panel"
      style={[styles.countCard, accent && { borderWidth: 1, borderColor: C.border }]}
    >
      <Text style={[TYPOGRAPHY.label, { color: accent ? C.accentBright : C.text2 }]}>{eyebrow}</Text>
      <Text style={[TYPOGRAPHY.heading, styles.countValue, { color: C.text }]} allowFontScaling={false}>
        {value}
      </Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 5 }]}>{caption}</Text>
    </Card>
  );
}

export default function PlanVsActualScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { series, plannedDue, doneDue, gap, hasData, headline, gapBody } = usePlanVsActual();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Söz ve gerçek</Text>
      </View>

      {!hasData ? (
        <EmptyState
          title="Karşılaştıracak plan yok."
          body="Rotan çizildiğinde planladığın ve gerçekleşen ilerlemeni burada yan yana görürsün."
          style={styles.empty}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(560)}>
            <Text style={[styles.headline, { color: C.text }]}>{headline}</Text>
            <Text style={[TYPOGRAPHY.caption, styles.lede, { color: C.text2 }]}>
              Soluk hat plana göre nerede olman gerektiğini, parlak hat gerçekte nerede
              olduğunu gösterir.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(560)} style={{ marginTop: 24 }}>
            <PlanVsActualChart series={series} C={C} />
            <View style={styles.legend}>
              <Legend C={C} color={C.down} label="Plan" />
              <Legend C={C} color={C.accent} label="Gerçek" />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(560)} style={styles.cards}>
            <CountCard C={C} eyebrow="PLANDA" value={plannedDue} caption="durak bitmeliydi" />
            <CountCard C={C} eyebrow="GERÇEKTE" value={doneDue} caption="durak bitti" accent />
          </Animated.View>

          {gapBody && (
            <Card tone="surface" radius="panel" style={{ marginTop: 22 }}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ARADAKİ BOŞLUK</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text2, marginTop: 10, lineHeight: 21 }]}>
                {gapBody}
              </Text>
            </Card>
          )}

          {gap > 0 && (
            <View style={{ marginTop: 26 }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => navigation.navigate(SCREENS.TOPIC_DEBT)}
                accessibilityLabel="Boşluğu kapatma planı"
              >
                Boşluğu kapatma planı
              </Button>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Legend({ C, color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBar, { backgroundColor: color }]} />
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 40 },
  empty: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center" },
  headline: { fontFamily: "Bricolage_400", fontSize: 25, lineHeight: 31, maxWidth: 290 },
  lede: { marginTop: 10, maxWidth: 300, lineHeight: 21 },
  legend: { flexDirection: "row", gap: STEP.s3, paddingTop: 6, paddingHorizontal: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  legendBar: { width: 16, height: 3, borderRadius: 1 },
  cards: { flexDirection: "row", gap: 10, marginTop: 26 },
  countCard: { flex: 1, padding: 18 },
  countValue: { fontSize: 28, lineHeight: 34, marginTop: 10 },
});
