import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Card, Button, EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useTopicDebt } from "../../hooks/useTopicDebt";
import { TopicDebtStopRow } from "./components/TopicDebtStopRow";
import { TopicDebtHero } from "./components/TopicDebtHero";
import { DebtDistributedView } from "./components/DebtDistributedView";
import * as H from "../../lib/haptics";

function TopicDebtImpactCard({ C, totalHours }) {
  return (
    <Card tone="surface" radius="panel" style={styles.impactCard}>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 1, marginBottom: STEP.s2 }]}>
        BU DURAKLARI KAPATINCA
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: STEP.s4 }}>
        <Text style={[TYPOGRAPHY.heading, { color: C.up, fontSize: 32 }]}>{totalHours} sa</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, flex: 1 }]}>
          çalışma yükü kapanır - rotan daha dengeli hale gelir
        </Text>
      </View>
      
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, marginBottom: STEP.s3 }]}>
        Düzenli tekrar ve soru çözümü, sonraki denemelerde daha iyi bir sonuç için zemin oluşturur.
      </Text>
      <View style={{ flexDirection: "row", gap: STEP.s2, marginBottom: STEP.s3 }}>
        <View style={styles.chip}><Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Çalışma yükü %18 azaldı</Text></View>
        <View style={styles.chip}><Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Rota yeniden dengeleniyor</Text></View>
      </View>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, opacity: 0.7 }]}>
        Rota tamamlanmadı ama yön doğru · uygulama içi rota göstergeleri, net tahmini değildir
      </Text>
    </Card>
  );
}

export default function TopicDebtScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { stops, stopCount, totalHours, hasHours, capped, canDistribute, distributing, distribute, isEmpty } = useTopicDebt();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Konu borcu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TopicDebtHero totalHours={totalHours} hasHours={hasHours} capped={capped} />

        {hasHours ? (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <TopicDebtImpactCard C={C} totalHours={totalHours} />
          </Animated.View>
        ) : null}

        {isEmpty ? (
          <EmptyState
            title="Konu borcun yok."
            body="Atlanmış durak oluştuğunda burada görünür; dağıtınca rota yeniden dengelenir."
            style={{ marginTop: STEP.s5 }}
          />
        ) : (
          <Animated.View entering={FadeInDown.delay(140).duration(560)} style={styles.listWrap}>
            <View style={styles.listHead}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİRİKEN DURAKLAR</Text>
              <View style={[styles.rule, { backgroundColor: C.line }]} />
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{stopCount} durak</Text>
            </View>
            {stops.map((item) => (
              <TopicDebtStopRow
                key={item.key}
                item={{
                  subjectKey: item.subjectKey,
                  title: item.title,
                  statusLabel: "atlandı",
                  dueLabel: `${item.hours} sa`,
                  minutesLabel: `${item.hours} sa`,
                }}
                C={C}
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth onPress={distribute} loading={distributing} disabled={!canDistribute}>Borcu üç haftaya dağıt</Button>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>
          Dağıtınca borç durakları rotaya yeniden yazılır.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  impactCard: { marginTop: STEP.s4, padding: STEP.s4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: SHAPE.chip, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)" },
  listWrap: { marginTop: STEP.s5 },
  listHead: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s3 },
  rule: { flex: 1, height: 1 },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
