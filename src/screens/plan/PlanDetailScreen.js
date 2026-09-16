import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card, Button } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";

function StopRow({ done, C, subjectColor, subject, title, meta, hasStart }) {
  return (
    <View style={styles.stopRow}>
      {done ? (
        <View style={styles.checkWrap}>
          <Icon name="check" size={14} color={C.up} sw={2.5} />
        </View>
      ) : (
        <View style={[styles.circle, { borderColor: hasStart ? C.accent : C.text2 }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: done ? C.text3 : C.text, textDecorationLine: done ? "line-through" : "none" }]} numberOfLines={1}>
          {subject} · {title}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 2 }]}>{meta}</Text>
      </View>
      {hasStart ? (
        <Pressable style={styles.startBtn}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>Başla</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function PlanDetailScreen({ route }) {
  const C = useC();
  const navigation = useNavigation();
  // Using a mock param for empty state demonstration
  const isEmpty = route?.params?.isEmpty || false; 

  const dayLabel = isEmpty ? "Perşembe, 25 Haziran" : "Salı, 23 Haziran";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>{dayLabel}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.cardsRow}>
          <Card tone="surface" radius="panel" style={styles.statCard}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1 }]}>PLANLANAN</Text>
            <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 24, marginTop: STEP.s2 }]}>
              {isEmpty ? "―" : "3 sa 20 dk"}
            </Text>
          </Card>
          <Card tone="surface" radius="panel" style={styles.statCard}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1 }]}>GERÇEKLEŞEN</Text>
            <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 24, marginTop: STEP.s2 }]}>
              {isEmpty ? "―" : "2 sa 45 dk"}
            </Text>
          </Card>
        </Animated.View>

        {!isEmpty ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.progressBarWrap}>
              <View style={[styles.progressBase, { backgroundColor: C.track }]}>
                <View style={[styles.progressFill, { backgroundColor: C.accent, width: "80%" }]} />
              </View>
            </View>
            
            <View style={styles.subjectRow}>
              <View style={styles.subItem}><View style={[styles.subDot, { backgroundColor: C.subjects?.matematik || "orange" }]} /><Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Matematik · 1 sa 30 dk</Text></View>
              <View style={styles.subItem}><View style={[styles.subDot, { backgroundColor: C.subjects?.turkce || "blue" }]} /><Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Türkçe · 45 dk</Text></View>
              <View style={styles.subItem}><View style={[styles.subDot, { backgroundColor: C.subjects?.felsefe || "purple" }]} /><Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Felsefe · 30 dk</Text></View>
            </View>

            <View style={styles.listHeader}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1 }]}>GÜNÜN DURAKLARI</Text>
              <View style={[styles.rule, { backgroundColor: C.line }]} />
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>2/4</Text>
            </View>

            <View style={styles.stopsList}>
              <StopRow done C={C} subject="Türkçe" title="Sözcükte Anlam" meta="09:30 · 45 dk · 32 soru" />
              <StopRow done C={C} subject="Matematik" title="Permütasyon" meta="14:00 · 1 sa · 24 soru" />
              <StopRow C={C} hasStart subject="Matematik" title="Kombinasyon" meta="19:30 · 50 dk" />
              <StopRow C={C} subject="Felsefe" title="Bilgi Felsefesi" meta="21:00 · 24 dk" />
            </View>

            <Card tone="surface" radius="panel" style={{ marginTop: STEP.s5, padding: STEP.s4 }}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1, marginBottom: STEP.s2 }]}>GÜNÜN ÖZETİ</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, lineHeight: 22 }]}>
                İki durak kapandı, 56 soru çözüldü. Akşamki iki durak planda duruyor; gün 2 sa 45 dk çalışmayla ilerledi.
              </Text>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card tone="void" radius="panel" style={{ marginTop: STEP.s5, padding: STEP.s4, alignItems: "center", borderWidth: 1, borderColor: C.line }}>
              <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 20, marginBottom: STEP.s1 }]}>Bu gün için henüz durak yok.</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, textAlign: "center" }]}>İstersen 20 dakikalık bir dönüş durağı ekleyebilirsin.</Text>
            </Card>

            <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3, padding: STEP.s4, borderWidth: 1, borderColor: C.accent + "40" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: STEP.s2 }}>
                <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1 }]}>ÖNERİLEN</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                  <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 24 }]}>20</Text>
                  <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
                </View>
              </View>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accent, marginBottom: 4 }]}>20 dakikalık dönüş durağı</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>10 dakika konu tekrarı · 10 soru</Text>
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK)}>Bugüne durak ekle</Button>
        <Button variant="ghost" size="md" fullWidth style={{ marginTop: STEP.s2 }}>
          {isEmpty ? "Bu günü boş bırak" : "Günü yeniden düzenle"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4, paddingBottom: 160 },
  cardsRow: { flexDirection: "row", gap: STEP.s2 },
  statCard: { flex: 1, padding: STEP.s3 },
  progressBarWrap: { marginTop: STEP.s4, height: 4 },
  progressBase: { height: 4, borderRadius: 2 },
  progressFill: { height: "100%", borderRadius: 2 },
  subjectRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s3, marginTop: STEP.s3 },
  subItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  subDot: { width: 8, height: 8, borderRadius: 1 },
  listHeader: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s5, paddingBottom: STEP.s3 },
  rule: { flex: 1, height: 1 },
  stopsList: { gap: STEP.s4 },
  stopRow: { flexDirection: "row", alignItems: "center", gap: STEP.s3 },
  checkWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(52, 211, 153, 0.15)", alignItems: "center", justifyContent: "center" },
  circle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  startBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});

