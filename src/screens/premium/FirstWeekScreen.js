import React, { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useFirstWeekMomentData } from "../../hooks/useFirstWeekMomentData";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { resetToTabStackScreen } from "../../navigation/rootStackActions";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { Press } from "../../components/design/Press";

// Tasarim: "Ilk 7 Gun". Ilk haftanin rehber gorev listesi.
export default function FirstWeekScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const moment = useFirstWeekMomentData();

  const handleClose = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  const openRoute = useCallback(() => {
    H.select();
    resetToTabStackScreen(navigation, TAB_KEYS.ROTA, SCREENS.ROADMAP);
  }, [navigation]);

  const handleTaskAction = useCallback((step) => {
    H.select();
    if (step?.screen) {
      navigation.navigate(step.screen);
      return;
    }
    if (step?.key === "second_day") {
      navigation.navigate(SCREENS.ADD_TASK);
      return;
    }
    openRoute();
  }, [navigation, openRoute]);

  const stepState = new Map((moment.steps || []).map((step) => [step.key, step.done]));
  const completedTasks = moment.completedTasks;
  const totalTasks = moment.totalTasks;
  const currentDay = moment.dayNumber || 1;

  const steps = [
    { id: 1, key: "trial", title: "İlk deneme sonucunu ekle", sub: "Ders bazlı net · 5 dakika", screen: SCREENS.FIRST_ROUTE_READY },
    { id: 2, key: "study", title: "İlk çalışma oturumunu tamamla", sub: "Pomodoro · 25 dakika", screen: SCREENS.STUDY_PROCESSED },
    { id: 3, key: "first_stop", title: "İlk durağı kapat", sub: "Rotandaki ilk konu" },
    { id: 4, key: "second_day", title: "İkinci çalışma gününü oluştur", sub: "Programa bir gün daha ekle" },
    { id: 5, key: "next_stop", title: "Bir sonraki durağı gör", sub: "Rota detayında sıradaki konu" },
    { id: 6, key: "weekly_summary", title: "Haftalık mini özeti incele", sub: "Pazar akşamı gelir", screen: SCREENS.ONE_WEEK_COMPLETED },
    { id: 7, key: "route_learning", title: "Rota değişimini fark et", sub: "İlk hafta öncesi ve sonrası" },
  ];
  const decoratedSteps = steps.map((step) => ({
    ...step,
    done: Boolean(stepState.get(step.key)),
    active: !stepState.get(step.key) && step.id === Math.min(totalTasks, completedTasks + 1),
    cta: step.key === "second_day" ? "Başla" : "Aç",
  }));
  const activeStep = decoratedSteps.find((step) => step.active);

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: GUTTER }]}>
        <Press haptic="none" onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={24} color={C.text2} />
        </Press>
        <Text style={[styles.headerTitle, { color: C.text }]}>İlk haftan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s5 }}>
        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s2 }}>
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

        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: C.text2 }]}>GÜN GÜN</Text>
            <View style={[styles.line, { backgroundColor: C.line }]} />
            <Text style={[styles.sectionDay, { color: C.text3 }]}>bugün {currentDay}. gün</Text>
          </View>

          <View style={styles.taskList}>
            {decoratedSteps.map((step) => (
              <Press haptic="none"
                key={step.id}
                onPress={() => handleTaskAction(step)}
                disabled={step.done}
                accessibilityRole={!step.done ? "button" : undefined}
                style={[styles.taskItem, { borderTopColor: C.line, paddingTop: STEP.s3, paddingBottom: STEP.s3, borderTopWidth: 1 }]}
              >
                <Text style={[styles.taskNumber, { color: step.active ? C.accentBright : C.text3 }]}>
                  {step.id}
                </Text>
                
                {step.done ? (
                  <View style={[styles.taskIconDone, { backgroundColor: C.up }]}>
                    <Icon name="check" size={14} color={C.bg} strokeWidth={2.1} />
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
                    title={step.cta}
                    onPress={() => handleTaskAction(step)}
                    variant="secondary"
                    size="small"
                  />
                )}
              </Press>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s3 }}>
          <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <Text style={[styles.infoText, { color: C.text2 }]}>
              Bu hafta hiçbir şey kilitli değil. Duraklar, çalışma takibi ve yanlış defteri açık; Maraton önerir, karar senin.
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <Button
            title={activeStep ? `${activeStep.id}. adımı yap` : "Rotayı gör"}
            onPress={() => activeStep ? handleTaskAction(activeStep) : openRoute()}
            size="large"
          />
          <Press haptic="none" onPress={handleClose} style={styles.backButton}>
            <Text style={[styles.backText, { color: C.text3 }]}>Ana sayfaya dön</Text>
          </Press>
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
