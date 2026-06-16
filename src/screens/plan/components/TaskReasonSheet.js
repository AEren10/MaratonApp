import { useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { TrendChart } from "../../analysis/components/TrendChart";
import { TRIAL_TO_CURRICULUM } from "../../trial/trialKeyMap";

// Görev gerekçesi + son denemelerde bu dersin net trendi.
function trialKeysForCurriculum(curriculumKey) {
  return Object.entries(TRIAL_TO_CURRICULUM)
    .filter(([, vals]) => vals.includes(curriculumKey))
    .map(([trialKey]) => trialKey);
}

export function TaskReasonSheet({ task, trials, onClose }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const trend = useMemo(() => {
    if (!task) return { data: [], labels: [] };
    const trialKeys = trialKeysForCurriculum(task.s?.key);
    const points = [...(trials || [])]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7)
      .map((t) => {
        let net = 0;
        trialKeys.forEach((k) => { net += t.subjects?.[k]?.net || 0; });
        return { net, date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) };
      })
      .filter((p) => p.net !== 0);
    return { data: points.map((p) => p.net), labels: points.map((p) => p.date) };
  }, [task, trials]);

  return (
    <Modal visible={!!task} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />
          {task ? (
            <>
              <View style={s.titleRow}>
                <View style={[s.dot, { backgroundColor: task.s?.color || C.amber }]} />
                <Text style={s.title}>{task.topic}</Text>
              </View>

              <View style={s.reasonBox}>
                <Icon name="info" size={16} color={C.amber} />
                <Text style={s.reasonText}>{task.reason}</Text>
              </View>

              <Text style={s.sub}>{task.q} soru hedeflendi</Text>

              {trend.data.length >= 2 ? (
                <View style={{ marginTop: SPACING.lg }}>
                  <TrendChart data={trend.data} labels={trend.labels} color={task.s?.color || C.amber} title="Bu derste net trendi" />
                </View>
              ) : (
                <Text style={s.empty}>Net trendi için en az 2 deneme gerek.</Text>
              )}

              <Pressable onPress={onClose} style={s.closeBtn}>
                <Text style={s.closeText}>Kapat</Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (C) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: SPACING.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { ...TYPOGRAPHY.subheading, color: C.text, flex: 1 },
  reasonBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.amber + "12",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  reasonText: { ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 },
  sub: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.sm },
  empty: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.lg, textAlign: "center" },
  closeBtn: { alignItems: "center", paddingVertical: SPACING.md, marginTop: SPACING.lg, backgroundColor: C.surface2, borderRadius: RADIUS.lg },
  closeText: { ...TYPOGRAPHY.button, color: C.text },
});
