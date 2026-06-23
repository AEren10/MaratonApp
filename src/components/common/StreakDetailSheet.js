import { useMemo, useCallback } from "react";
import { View, Text, Pressable, Modal, Platform, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { nextMondayReset } from "../../lib/streakFreeze";

function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"][d.getDay()];
}

function isStudied(lastStudyDate, offset) {
  if (!lastStudyDate) return false;
  const target = new Date();
  target.setDate(target.getDate() - offset);
  const targetStr = target.toISOString().split("T")[0];
  if (offset === 0) {
    return lastStudyDate === targetStr;
  }
  return lastStudyDate >= targetStr;
}

function StreakCalendar({ lastStudyDate, streak, C }) {
  const days = Array.from({ length: 7 }, (_, i) => 6 - i);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <View style={cal.row}>
      {days.map((offset) => {
        const label = dayLabel(offset);
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const dateStr = d.toISOString().split("T")[0];
        const isToday = offset === 0;
        const active = lastStudyDate && streak > offset && dateStr <= lastStudyDate;

        return (
          <View key={offset} style={cal.dayCol}>
            <Text style={[cal.dayLabel, { color: C.muted }]}>{label}</Text>
            <View style={[
              cal.dot,
              active
                ? { backgroundColor: C.orange }
                : { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
              isToday && !active && { borderColor: C.orange, borderWidth: 2 },
            ]}>
              {active && <Icon name="check" size={12} color="#FFFFFF" sw={3} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const cal = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: SPACING.sm },
  dayCol: { alignItems: "center", gap: 6 },
  dayLabel: { ...TYPOGRAPHY.micro, textTransform: "uppercase" },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});

export function StreakDetailSheet({ visible, onClose, streak, longestStreak, freezeCount, freezeResetAt, lastStudyDate }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  const todayStr = new Date().toISOString().split("T")[0];
  const studiedToday = lastStudyDate === todayStr;
  const hour = new Date().getHours();
  const atRisk = !studiedToday && hour >= 18;

  const resetLabel = useMemo(() => {
    if (!freezeResetAt) return "Pazartesi";
    const d = new Date(freezeResetAt);
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    return days[d.getDay()];
  }, [freezeResetAt]);

  return (
    <Modal visible={visible} transparent animationType={Platform.OS === "web" ? "none" : "slide"} onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: C.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={[s.handle, { backgroundColor: C.border }]} />

          {/* Streak Hero */}
          <Animated.View entering={FadeInDown.duration(400)} style={s.hero}>
            <LinearGradient
              colors={streak > 0 ? [C.orange + "20", "transparent"] : [C.surface2, "transparent"]}
              style={s.heroBg}
            />
            <View style={[s.flameCircle, { backgroundColor: streak > 0 ? C.orange + "1A" : C.surface2 }]}>
              <Icon name="flame" size={36} color={streak > 0 ? C.orange : C.muted} sw={2.4} />
            </View>
            <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{streak}</Text>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.sec }]}>
              {streak === 0 ? "Henüz streak yok" : streak === 1 ? "günlük seri" : "günlük seri"}
            </Text>
          </Animated.View>

          {/* At Risk Warning */}
          {atRisk && streak > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={[s.riskBanner, { backgroundColor: C.danger + "14", borderColor: C.danger + "28" }]}>
              <Icon name="alert" size={18} color={C.danger} />
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.danger, flex: 1 }]}>
                Bugün çalışmadın! Serin kırılabilir.
              </Text>
            </Animated.View>
          )}

          {/* Stats Row */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: C.surface2 }]}>
              <Icon name="trophy" size={18} color={C.amber} />
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{longestStreak}</Text>
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>En uzun</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: freezeCount > 0 ? C.info + "14" : C.surface2 }]}>
              <Icon name="shield" size={18} color={freezeCount > 0 ? C.info : C.muted} />
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{freezeCount}</Text>
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>Joker hak</Text>
            </View>
          </Animated.View>

          {/* Calendar */}
          <Animated.View entering={FadeInDown.duration(400).delay(250)} style={s.calendarWrap}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec, marginBottom: SPACING.md }]}>Son 7 gün</Text>
            <StreakCalendar lastStudyDate={lastStudyDate} streak={streak} C={C} />
          </Animated.View>

          {/* Freeze Info */}
          <Animated.View entering={FadeInDown.duration(400).delay(350)} style={[s.freezeInfo, { backgroundColor: C.surface2 }]}>
            <Icon name="shield" size={16} color={C.info} />
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, flex: 1 }]}>
              Haftada 1 joker hakkın var. Bir gün atlasan bile serin korunur. Yenileme: {resetLabel}
            </Text>
          </Animated.View>

          <Pressable onPress={onClose} style={[s.closeBtn, { backgroundColor: C.accent }]}>
            <Text style={[TYPOGRAPHY.button, { color: "#FFFFFF" }]}>Tamam</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    backdrop: {
      flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
      paddingHorizontal: SPACING.xl, paddingBottom: SPACING.huge,
    },
    handle: {
      width: 36, height: 4, borderRadius: 2, alignSelf: "center",
      marginTop: SPACING.md, marginBottom: SPACING.lg,
    },
    hero: { alignItems: "center", paddingBottom: SPACING.lg, position: "relative" },
    heroBg: {
      position: "absolute", top: -SPACING.lg, left: -SPACING.xl, right: -SPACING.xl,
      height: 140, borderRadius: RADIUS.xxl,
    },
    flameCircle: {
      width: 64, height: 64, borderRadius: 32,
      alignItems: "center", justifyContent: "center", marginBottom: SPACING.xs,
    },
    riskBanner: {
      flexDirection: "row", alignItems: "center", gap: SPACING.sm,
      padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1,
      marginBottom: SPACING.lg,
    },
    statsRow: {
      flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.xl,
    },
    statCard: {
      flex: 1, alignItems: "center", gap: 4,
      paddingVertical: SPACING.lg, borderRadius: RADIUS.xl,
    },
    calendarWrap: { marginBottom: SPACING.xl },
    freezeInfo: {
      flexDirection: "row", alignItems: "center", gap: SPACING.sm,
      padding: SPACING.md, borderRadius: RADIUS.lg,
      marginBottom: SPACING.xl,
    },
    closeBtn: {
      alignItems: "center", paddingVertical: SPACING.lg,
      borderRadius: RADIUS.lg,
    },
  });
}
