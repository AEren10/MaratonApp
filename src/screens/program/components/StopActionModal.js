import React, { useMemo } from "react";
import { View, Text, Modal, StyleSheet, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { useStopMoves } from "../../../hooks/useStopMoves";
import { useClassSchedule } from "../../../hooks/useClassSchedule";
import { addDays, mondayOf } from "../../../domain/program/dayKeys";
import { todayTR } from "../../../lib/dateUtils";
import * as H from "../../../lib/haptics";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function StopActionModal({ visible, stop, dateKey, onClose }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const { moveStop, postponeStop, loaded } = useStopMoves();
  const { schedule } = useClassSchedule();

  const monday = mondayOf(dateKey || todayTR());
  const today = todayTR();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const iso = addDays(monday, i);
      const dayNum = parseInt(iso.slice(8, 10), 10);
      const isPast = iso < today;
      const isCurrent = iso === dateKey;
      return { iso, label: DAY_LABELS[i], dayNum, isPast, isCurrent };
    });
  }, [monday, dateKey, today]);

  if (!visible || !stop) return null;

  const dotColor = subjectColorOf(C, stop.subjectKey || stop.subjectLabel);

  const handlePostpone = async () => {
    if (!loaded || !stop.logicalStopKey) return;
    const res = await postponeStop(stop.logicalStopKey, schedule, dateKey);
    if (res.ok) { H.select(); onClose(); return; }
    Alert.alert("Erteleme yapılamadı", res.reason === "no_day"
      ? "Bu hafta başka çalışma günü yok; hafta bitince Geride kalan konulara düşer."
      : "Kaydedilemedi. Bağlantını kontrol et.");
  };

  const handleMove = async (targetIso) => {
    if (!loaded || !stop.logicalStopKey) return;
    const ok = await moveStop(stop.logicalStopKey, targetIso);
    if (ok) { H.select(); onClose(); return; }
    Alert.alert("Taşınamadı", "Kaydedilemedi. Bağlantını kontrol et.");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[s.backdrop, { backgroundColor: C.scrim }]} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: C.surface, borderColor: C.elev, marginBottom: insets.bottom + STEP.s3 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={s.head}>
            <View style={s.titleRow}>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
              <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]} numberOfLines={1}>
                {stop.subjectLabel}{stop.topic ? ` · ${stop.topic}` : ""}
              </Text>
            </View>
            <Press haptic="none" onPress={onClose} hitSlop={STEP.s2}>
              <Icon name="x" size={18} color={C.text3} />
            </Press>
          </View>

          <Press
            haptic="light"
            disabled={!loaded}
            onPress={handlePostpone}
            style={[s.postponeBtn, { backgroundColor: C.elev, borderColor: C.line, opacity: loaded ? 1 : 0.5 }]}
          >
            <Icon name="arrowR" size={16} color={C.accent} />
            <View style={s.postponeTextWrap}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Yarına ertele</Text>
              <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Bu haftanın sonraki çalışma gününe kaydır</Text>
            </View>
          </Press>

          <Text style={[TYPOGRAPHY.label, s.sectionLabel, { color: C.text3 }]}>BAŞKA GÜNE TAŞI</Text>

          <View style={s.daysRow}>
            {weekDays.map((d) => {
              const disabled = !loaded || d.isPast || d.isCurrent;
              return (
                <Press
                  key={d.iso}
                  haptic="light"
                  disabled={disabled}
                  onPress={() => handleMove(d.iso)}
                  style={[
                    s.dayChip,
                    {
                      borderColor: d.isCurrent ? C.accent : d.isPast ? C.line : C.border,
                      backgroundColor: d.isCurrent ? C.void : d.isPast ? "transparent" : C.elev,
                      opacity: d.isPast ? 0.35 : 1,
                    },
                  ]}
                >
                  <Text style={[TYPOGRAPHY.micro, { color: d.isCurrent ? C.accentBright : C.text3 }]}>{d.label}</Text>
                  <Text style={[TYPOGRAPHY.tableName, { color: d.isCurrent ? C.accentBright : d.isPast ? C.text3 : C.text }]}>
                    {d.dayNum}
                  </Text>
                </Press>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", paddingHorizontal: GUTTER },
  sheet: { borderRadius: SHAPE.cardTight, borderWidth: 1, padding: STEP.s3 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, flex: 1, marginRight: STEP.s2 },
  dot: { width: 8, height: 8, borderRadius: SHAPE.chip },
  postponeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  postponeTextWrap: { flex: 1 },
  sectionLabel: { marginTop: STEP.s3, marginBottom: STEP.s2 },
  daysRow: { flexDirection: "row", gap: SPACING.xs },
  dayChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
});
