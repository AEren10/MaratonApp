import { useState, useCallback, useMemo, useEffect } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, GlowBackground, WARM_GLOW } from "../../components/design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { generateDailyPlan } from "../../lib/planEngine";
import { getSubjectByKey } from "../../themes/subjects";
import { useAppSelector } from "../../store/hooks";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectAdHocTasks } from "../../store/slices/planSlice";
import { usePlanContext } from "../../hooks/usePlanContext";
import * as haptic from "../../lib/haptics";
import { PlanHeader } from "./components/PlanHeader";
import { PlanTaskItem } from "./components/PlanTaskItem";
import { TaskReasonSheet } from "./components/TaskReasonSheet";

export default function PlanDetailScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const trials = useAppSelector(selectTrials);
  const adHocTasks = useAppSelector(selectAdHocTasks);
  const ctx = usePlanContext();

  const plan = useMemo(() => generateDailyPlan(ctx), [ctx]);

  const initialTasks = useMemo(() => {
    const generated = plan.tasks.map((t, i) => {
      const subj = getSubjectByKey(t.subject);
      return {
        id: String(i + 1),
        s: subj || { key: t.subject, label: t.subjectLabel, color: t.color, icon: "bookOpen" },
        topic: t.topicLabel || t.subjectLabel,
        topicKey: t.topic,
        q: t.questionCount,
        reason: t.reason,
        rkind: t.rkind || "gray",
        done: t.completed,
      };
    });
    const adHoc = adHocTasks.map((t) => {
      const subj = getSubjectByKey(t.subject);
      return {
        id: t.id,
        s: subj || { key: t.subject, label: t.subjectLabel, color: t.color || "#EBAE63", icon: "bookOpen" },
        topic: t.topic ? `${t.subjectLabel} · ${t.topic}` : t.subjectLabel,
        topicKey: t.topic,
        q: t.questionCount,
        reason: t.reason,
        rkind: "red",
        done: false,
        adHoc: true,
      };
    });
    return [...adHoc, ...generated];
  }, [plan, adHocTasks]);

  const [tasks, setTasks] = useState(initialTasks);
  const [reasonTask, setReasonTask] = useState(null);

  // Plan/ad-hoc değişince listeyi tazele ama mevcut done durumlarını koru.
  const taskSig = initialTasks.map((t) => t.id).join("|");
  useEffect(() => {
    setTasks((prev) => {
      const doneById = {};
      prev.forEach((t) => { doneById[t.id] = t.done; });
      return initialTasks.map((t) => ({ ...t, done: doneById[t.id] ?? t.done }));
    });
  }, [taskSig]); // eslint-disable-line react-hooks/exhaustive-deps
  const doneCount = tasks.filter((t) => t.done).length;
  const dateLabel = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const estHours = plan.estimatedMinutes >= 60
    ? `~${Math.round(plan.estimatedMinutes / 60)} saat`
    : `~${plan.estimatedMinutes} dk`;

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) haptic.success();
        return { ...t, done: !t.done };
      })
    );
  }, []);

  const startTask = useCallback(
    (id) => {
      const task = tasks.find((t) => t.id === id);
      navigation.navigate(SCREENS.STUDY_TIMER, {
        taskId: id,
        subjectKey: task?.s?.key,
        topicName: task?.topic,
      });
    },
    [navigation, tasks]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.title}>Gunluk Plan</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <PlanHeader
          done={doneCount}
          total={tasks.length}
          soru={plan.totalQuestions}
          hours={estHours}
        />

        <View style={styles.listLabel}>
          <Icon name="layers" size={16} color={C.sec} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec }}>
            Gorevler
          </Text>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <PlanTaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onStart={() => startTask(task.id)}
              onInfo={() => setReasonTask(task)}
            />
          ))}
        </View>
      </ScrollView>

      <TaskReasonSheet task={reasonTask} trials={trials} onClose={() => setReasonTask(null)} />
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      gap: SPACING.md,
    },
    title: { ...TYPOGRAPHY.subheading, color: C.text, flex: 1 },
    date: { ...TYPOGRAPHY.captionMedium, color: C.muted },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 90 },
    listLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    taskList: { gap: SPACING.md },
  });
}
