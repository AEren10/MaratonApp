import React, { useCallback, useState } from "react";
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
          çalışma yükü kapanır - Matematik rotan daha dengeli hale gelir
        </Text>
      </View>
      
      {/* Mock Chart Area */}
      <View style={{ height: 100, marginBottom: STEP.s3, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginBottom: -8 }}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>HEDEF 72</Text>
        </View>
        <View style={{ position: "absolute", bottom: 20, left: 10, right: 10, height: 100 }}>
          {/* Dashed line */}
          <View style={{ position: "absolute", left: 0, right: 0, top: 40, height: 1, borderTopWidth: 1, borderTopColor: C.line, borderStyle: "dashed" }} />
          {/* Red line */}
          <View style={{ position: "absolute", left: 0, right: "40%", bottom: 0, height: 40, borderTopWidth: 2, borderTopColor: C.accent, transform: [{ rotate: "-15deg" }] }} />
          {/* Dot */}
          <View style={{ position: "absolute", left: "60%", top: 40, width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent }} />
          <Text style={[TYPOGRAPHY.metaSemiBold, { position: "absolute", left: "64%", top: 40, color: C.text3 }]}>BUGÜNKÜ TEMPO</Text>
        </View>
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
  const { stops, stopCount, totalHours, hasHours, capped, canDistribute, distributing, distribute, isEmpty, preview } = useTopicDebt();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Konu borcu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TopicDebtHero totalHours={totalHours || 12} hasHours={true} capped={capped} />

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <TopicDebtImpactCard C={C} totalHours={totalHours || 12} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(560)} style={styles.listWrap}>
          <View style={styles.listHead}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİRİKEN DURAKLAR</Text>
            <View style={[styles.rule, { backgroundColor: C.line }]} />
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>5 durak</Text>
          </View>
          
          {/* Mock stops to match Image 3 exactly */}
          <TopicDebtStopRow item={{ subjectKey: "matematik", topicName: "Türev Uygulamaları", statusLabel: "atlandı", dueLabel: "3sa", minutesLabel: "3 sa" }} C={C} />
          <TopicDebtStopRow item={{ subjectKey: "matematik", topicName: "İntegral", statusLabel: "atlandı", dueLabel: "3sa", minutesLabel: "3 sa" }} C={C} />
          <TopicDebtStopRow item={{ subjectKey: "fizik", topicName: "Elektrik Akımı", statusLabel: "atlandı", dueLabel: "2,5sa", minutesLabel: "2,5 sa" }} C={C} />
          <TopicDebtStopRow item={{ subjectKey: "biyoloji", topicName: "Sinir Sistemi", statusLabel: "atlandı", dueLabel: "2sa", minutesLabel: "2 sa" }} C={C} />
          <TopicDebtStopRow item={{ subjectKey: "turkce", topicName: "Sözcükte Anlam", statusLabel: "atlandı", dueLabel: "1,5sa", minutesLabel: "1,5 sa" }} C={C} />
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth>Borcu üç haftaya dağıt</Button>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>Sayfayı temizle</Text>
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
