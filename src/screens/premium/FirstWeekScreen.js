import React, { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Tasarim: "Ilk 7 Gun". Ilk haftanin rehber gorev listesi.
export default function FirstWeekScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleClose = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  const handleTaskAction = useCallback(() => {
    H.select();
    navigation.navigate(SCREENS.ADD_TASK);
  }, [navigation]);

  const openMoment = useCallback((screenName) => {
    if (!screenName) return;
    H.select();
    navigation.navigate(screenName);
  }, [navigation]);

  // TODO: Ileride context'ten veya hook'tan alinacak (örn. useFirstWeekStatus)
  const completedTasks = 3;
  const totalTasks = 7;
  const currentDay = 4;

  const steps = [
    { id: 1, title: "İlk deneme sonucunu ekle", sub: "Ders bazlı net · 5 dakika", done: true, screen: SCREENS.FIRST_ROUTE_READY },
    { id: 2, title: "İlk çalışma oturumunu tamamla", sub: "Pomodoro · 25 dakika", done: true, screen: SCREENS.STUDY_PROCESSED },
    { id: 3, title: "İlk durağı kapat", sub: "Rotandaki ilk konu", done: true },
    { id: 4, title: "İkinci çalışma gününü oluştur", sub: "Programa bir gün daha ekle", done: false, active: true },
    { id: 5, title: "Bir sonraki durağı gör", sub: "Rota detayında sıradaki konu", done: false },
    { id: 6, title: "Haftalık mini özeti incele", sub: "Pazar akşamı gelir", done: false, screen: SCREENS.ONE_WEEK_COMPLETED },
    { id: 7, title: "Rota değişimini fark et", sub: "İlk hafta öncesi ve sonrası", done: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: GUTTER }]}>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={24} color={C.text2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>İlk haftan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s5 }}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s2 }}>
          <Text style={[styles.introText, { color: C.text2 }]}>
            Her gün küçük bir iş. Yedi gün sonunda rotanın nasıl çalıştığını görmüş olacaksın.
          </Text>

          <View style={styles.progressRow}>
            <Text style={[styles.progressNumber, { color: C.text }]}>{completedTasks}</Text>
            <Text style={[styles.progressText, { color: C.text3 }]}>/ {totalTasks} adım tamamlandı</Text>
          </View>

          <View style={styles.progressBars}>
            {Array.from({ length: totalTasks }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  { backgroundColor: i < completedTasks ? C.accent : C.track }
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: C.text2 }]}>GÜN GÜN</Text>
            <View style={[styles.line, { backgroundColor: C.line }]} />
            <Text style={[styles.sectionDay, { color: C.text3 }]}>bugün {currentDay}. gün</Text>
          </View>

          <View style={styles.taskList}>
            {steps.map((step, idx) => (
              <Pressable
                key={step.id}
                onPress={() => openMoment(step.screen)}
                disabled={!step.screen}
                accessibilityRole={step.screen ? "button" : undefined}
                style={[styles.taskItem, { borderTopColor: C.line, paddingTop: STEP.s3, paddingBottom: STEP.s3, borderTopWidth: 1 }]}
              >
                <Text style={[styles.taskNumber, { color: step.active ? C.accentBright : C.text3 }]}>
                  {step.id}
                </Text>
                
                {step.done ? (
                  <View style={[styles.taskIconDone, { backgroundColor: C.up }]}>
                    <Icon name="check" size={14} color="#06210F" strokeWidth={2.1} />
                  </View>
                ) : step.active ? (
                  <View style={[styles.taskIconActive, { borderColor: C.accent }]} />
                ) : (
                  <View style={[styles.taskIconPending, { borderColor: C.border }]} />
                )}

                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, { color: step.done ? C.text3 : C.text }]}>{step.title}</Text>
                  <Text style={[styles.taskSub, { color: C.text3 }]}>{step.sub}</Text>
                </View>

                {step.active && (
                  <Button
                    title="Bağla"
                    onPress={handleTaskAction}
                    variant="tint"
                    size="small"
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s3 }}>
          <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <Text style={[styles.infoText, { color: C.text2 }]}>
              Bu hafta hiçbir şey kilitli değil. Duraklar, çalışma takibi ve yanlış defteri açık; Maraton önerir, karar senin.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <Button
            title="4. adımı yap"
            onPress={handleTaskAction}
            size="large"
          />
          <Pressable onPress={handleClose} style={styles.backButton}>
            <Text style={[styles.backText, { color: C.text3 }]}>Ana sayfaya dön</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 22,
  },
  introText: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 13.5,
    lineHeight: 22,
    maxWidth: 300,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 11,
    marginTop: STEP.s3,
  },
  progressNumber: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 46,
    lineHeight: 46,
    letterSpacing: -1.38,
    fontVariant: ["tabular-nums"],
  },
  progressText: {
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 13.5,
    paddingBottom: 6,
  },
  progressBars: {
    flexDirection: "row",
    gap: 4,
    height: 6,
    marginTop: 14,
  },
  bar: {
    flex: 1,
    borderRadius: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    paddingBottom: 4,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.Archivo_600,
    fontSize: 11.5,
    letterSpacing: 1.84,
  },
  line: {
    flex: 1,
    height: 1,
  },
  sectionDay: {
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 11.5,
  },
  taskList: {
    marginTop: 15,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  taskNumber: {
    width: 20,
    fontFamily: TYPOGRAPHY.Archivo_600,
    fontSize: 11.5,
    letterSpacing: 1.15,
  },
  taskIconDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskIconActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  taskIconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 14,
  },
  taskSub: {
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 11,
    marginTop: 4,
  },
  infoCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 13,
    lineHeight: 21,
  },
  backButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  backText: {
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 13,
  },
});
