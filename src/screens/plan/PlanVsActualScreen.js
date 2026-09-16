import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card, Button, EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { usePlanVsActual } from "../../hooks/usePlanVsActual";
import { PlanVsActualChart } from "./components/PlanVsActualChart";

function CountCard({ C, eyebrow, value, caption, accent }) {
  return (
    <Card
      tone={accent ? "tint" : "surface"}
      radius="panel"
      style={[styles.countCard, accent && { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }]}
    >
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: accent ? C.text : C.text3, letterSpacing: 1 }]}>{eyebrow}</Text>
      <Text style={[TYPOGRAPHY.hero, styles.countValue, { color: C.text, fontSize: 40, marginTop: STEP.s2 }]} allowFontScaling={false}>
        {value}
      </Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 5 }]}>{caption}</Text>
    </Card>
  );
}

function Legend({ C, color, label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 12, height: 2, backgroundColor: color }} />
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{label}</Text>
    </View>
  );
}

export default function PlanVsActualScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { series, plannedDue, doneDue, gap, hasData, headline, gapBody } = usePlanVsActual();
  const openGapClosure = () => navigation.navigate(SCREENS.GAP_CLOSURE);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Söz ve gerçek</Text>
        </Pressable>
      </View>

      {!hasData ? (
        <EmptyState
          title="Karşılaştıracak plan yok."
          body="Rotan çizildiğinde planladığın ve gerçekleşen ilerlemeni burada yan yana görürsün."
          style={styles.empty}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(560)}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 1.5, marginBottom: STEP.s4 }]}>
                PLANLANAN vs GERÇEKLEŞEN
              </Text>
              <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 26, marginBottom: STEP.s2 }]}>{headline}</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, lineHeight: 22 }]}>
                Soluk hat plana göre nerede olman gerektiğini, parlak hat gerçekte nerede olduğunu gösterir.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(120).duration(560)} style={{ marginTop: STEP.s5 }}>
              <PlanVsActualChart series={series} C={C} />
              <View style={styles.legend}>
                <Legend C={C} color={C.text3} label="Plan" />
                <Legend C={C} color={C.accent} label="Gerçek" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(560)} style={styles.cards}>
              <CountCard C={C} eyebrow="PLANDA" value={plannedDue} caption="durak bitmeliydi" />
              <CountCard C={C} eyebrow="GERÇEKTE" value={doneDue} caption="durak bitti" accent />
            </Animated.View>

            <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3, padding: STEP.s4 }}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 1, marginBottom: STEP.s2 }]}>ARADAKİ BOŞLUK</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, lineHeight: 22 }]}>
                {gapBody || (gap > 0 ? "Boşluk var; nasıl kapatacağını seçebilirsin." : "Boşluk yok. Plan ve gerçek aynı çizgide ilerliyor.")}
              </Text>
            </Card>
          </ScrollView>

          <View style={[styles.bottomAction, { backgroundColor: C.bg }]}>
            <Button variant="primary" size="lg" fullWidth onPress={openGapClosure}>Boşluğu kapatma planı</Button>
            
            <View style={{ alignItems: "center", marginTop: STEP.s4, gap: STEP.s2 }}>
              <Pressable hitSlop={10}>
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, textDecorationLine: "underline" }]}>Tempoyu gerçeğe çek</Text>
              </Pressable>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", maxWidth: 280, opacity: 0.7 }]}>
                Hedefin aynı kalır. Haftalık yükünü son üç haftada gerçekten yaptığın kadarına indiririm.
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: 160 },
  empty: { marginTop: STEP.s5, paddingHorizontal: GUTTER },
  legend: { flexDirection: "row", alignItems: "center", gap: STEP.s4, marginTop: STEP.s3 },
  cards: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s5 },
  countCard: { flex: 1, padding: STEP.s3 },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
