import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Button } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import PillTabs from "../../components/common/PillTabs";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { WEEKDAYS_SHORT_TR } from "../../lib/trWords";

const TABS = [{ key: "week", label: "Hafta" }, { key: "month", label: "Ay" }];

function CalendarMockGrid({ C, selectedDay, onSelect }) {
  // Mock data for June
  const days = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // mock some dots
    const dots = [];
    if (dayNum % 3 === 0) dots.push(C.subjects?.matematik || "orange");
    if (dayNum % 4 === 0) dots.push(C.subjects?.fizik || "cyan");
    if (dayNum % 5 === 0) dots.push(C.subjects?.turkce || "blue");
    if (dayNum % 7 === 0) dots.push(C.accent); // deneme
    if (dots.length === 0) dots.push(C.subjects?.matematik || "orange");
    
    // Day 23 is Tuesday, June 2026 starts on Monday. So 0 offset.
    return { day: dayNum, dots: dots.slice(0, 3) }; // max 3 dots
  });

  return (
    <View style={s.gridWrap}>
      <View style={s.week}>
        {WEEKDAYS_SHORT_TR.map((w) => (
          <Text key={w} style={[TYPOGRAPHY.tableHead, s.head, { color: C.text3 }]}>{w}</Text>
        ))}
      </View>
      <View style={s.grid}>
        {days.map((d) => {
          const isSelected = selectedDay === d.day;
          return (
            <View key={d.day} style={s.cellWrap}>
              <Pressable
                onPress={() => onSelect(d.day)}
                style={[
                  s.cell,
                  isSelected ? { backgroundColor: C.accent, borderColor: C.accent } : { backgroundColor: C.surface, borderColor: C.elev }
                ]}
              >
                <Text style={[TYPOGRAPHY.meta, s.num, { color: isSelected ? C.accentInk : C.text }]}>{d.day}</Text>
                <View style={s.dots}>
                  {d.dots.map((color, idx) => (
                    <View key={idx} style={[s.dot, { backgroundColor: isSelected ? C.accentInk : color }]} />
                  ))}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CalendarScreenInner() {
  const C = useC();
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(23);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 26 }]}>Haziran</Text>
        <PillTabs options={TABS} value="month" onChange={() => navigation.navigate(SCREENS.DAILY_PLAN)} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={s.monthNav}>
            <Pressable hitSlop={12} accessibilityRole="button" style={s.tap}>
              <Icon name="chevL" size={14} color={C.text3} />
            </Pressable>
            <Text style={[TYPOGRAPHY.topicName, { color: C.text, fontVariant: ["tabular-nums"] }]}>
              2026 · 18 gün planlı
            </Text>
            <Pressable hitSlop={12} accessibilityRole="button" style={s.tap}>
              <Icon name="chevR" size={14} color={C.text3} />
            </Pressable>
          </View>

          <CalendarMockGrid C={C} selectedDay={selectedDay} onSelect={setSelectedDay} />

          <View style={s.legend}>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.subjects?.turkce || "blue" }]} /><Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Türkçe</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.subjects?.matematik || "orange" }]} /><Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Matematik</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.subjects?.fizik || "cyan" }]} /><Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Fizik</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.subjects?.biyoloji || "green" }]} /><Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Biyoloji</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: C.accent }]} /><Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Deneme</Text></View>
          </View>

          <View style={s.dayDetail}>
            <View style={s.dayHeader}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 1 }]}>SALI · {selectedDay} HAZİRAN</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>4 durak · 3 sa 20 dk</Text>
            </View>

            <View style={s.tasks}>
              <View style={styles.slotRow}>
                <Text style={[TYPOGRAPHY.metaSemiBold, styles.timeStr, { color: C.text3 }]}>08:30</Text>
                <View style={[styles.verticalLine, { backgroundColor: C.subjects?.turkce || "blue" }]} />
                <View style={styles.slotBody}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3, textDecorationLine: "line-through" }]}>Paragraf - Anlatım Biçimleri</Text>
                  </View>
                </View>
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>45 dk</Text>
              </View>
              
              <View style={styles.slotRow}>
                <Text style={[TYPOGRAPHY.metaSemiBold, styles.timeStr, { color: C.text3 }]}>10:00</Text>
                <View style={[styles.verticalLine, { backgroundColor: C.subjects?.matematik || "orange" }]} />
                <View style={styles.slotBody}>
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Permütasyon - Kombinasyon</Text>
                </View>
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>50 dk</Text>
              </View>

              <View style={styles.slotRow}>
                <Text style={[TYPOGRAPHY.metaSemiBold, styles.timeStr, { color: C.text3 }]}>18:00</Text>
                <View style={[styles.verticalLine, { backgroundColor: C.subjects?.biyoloji || "green" }]} />
                <View style={styles.slotBody}>
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Nükleik Asitler</Text>
                </View>
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>40 dk</Text>
              </View>

              <View style={styles.slotRow}>
                <Text style={[TYPOGRAPHY.metaSemiBold, styles.timeStr, { color: C.text3 }]}>19:30</Text>
                <View style={[styles.verticalLine, { backgroundColor: C.subjects?.matematik || "orange" }]} />
                <View style={styles.slotBody}>
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Defter tekrarı · 6 soru</Text>
                </View>
                <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>25 dk</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={[s.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth>{selectedDay} Haziran'a durak ekle</Button>
      </View>
    </SafeAreaView>
  );
}

export default function CalendarScreen() {
  return (
    <ScreenErrorBoundary>
      <CalendarScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingVertical: STEP.s2, paddingBottom: STEP.s4 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: STEP.s2, marginBottom: STEP.s4 },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  
  gridWrap: { marginBottom: STEP.s4 },
  week: { flexDirection: "row", paddingHorizontal: STEP.s2, marginBottom: STEP.s2 },
  head: { flex: 1, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: "14.28%", aspectRatio: 1, padding: 3 },
  cell: { flex: 1, borderRadius: SHAPE.cardTight, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: "Archivo_500", fontSize: 13 },
  dots: { flexDirection: "row", gap: 2, position: "absolute", bottom: 6 },
  dot: { width: 4, height: 4, borderRadius: 1 },
  
  legend: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s3, marginBottom: STEP.s5, paddingHorizontal: STEP.s2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 1 },

  dayDetail: { marginTop: STEP.s2 },
  dayHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s4 },
  tasks: { gap: STEP.s1 },
  
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});

const styles = StyleSheet.create({
  slotRow: { flexDirection: "row", alignItems: "center", gap: STEP.s3, paddingVertical: STEP.s2 },
  timeStr: { width: 38 },
  verticalLine: { width: 6, height: 6, borderRadius: 1 },
  slotBody: { flex: 1 },
});
