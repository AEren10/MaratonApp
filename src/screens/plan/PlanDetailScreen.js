import { useState, useCallback, useMemo } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useExam } from "../../contexts/ExamContext";
import { generateDailyPlan } from "../../lib/planEngine";
import { getSubjectByKey } from "../../themes/subjects";
import { useAppSelector } from "../../store/hooks";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectTodayLogs } from "../../store/slices/studyLogSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { trialSubjectsToCurriculumWeakAreas } from "../trial/trialKeyMap";
import { PlanHeader } from "./components/PlanHeader";
import { PlanTaskItem } from "./components/PlanTaskItem";

export default function PlanDetailScreen() {
  const navigation = useNavigation();
  const { examDate } = useExam();
  const trials = useAppSelector(selectTrials);
  const todayLogs = useAppSelector(selectTodayLogs);
  const dailyTarget = useAppSelector(selectDailyQuestionsGoal);

  const { weakAreas, recentStudy } = useMemo(() => {
    let wa = {};
    const rs = {};
    if (trials.length > 0) {
      const latest = trials[0];
      wa = trialSubjectsToCurriculumWeakAreas(latest.subjects);
    }
    todayLogs.forEach((l) => {
      if (l.subject && l.study_date) rs[l.subject] = l.study_date;
    });
    return { weakAreas: wa, recentStudy: rs };
  }, [trials, todayLogs]);

  const plan = useMemo(() => generateDailyPlan({ examDate, weakAreas, recentStudy, dailyTarget }), [examDate, weakAreas, recentStudy, dailyTarget]);

  const initialTasks = useMemo(() =>
    plan.tasks.map((t, i) => {
      const subj = getSubjectByKey(t.subject);
      return {
        id: String(i + 1),
        s: subj || { key: t.subject, label: t.subjectLabel, color: t.color, icon: "bookOpen" },
        topic: t.subjectLabel,
        q: t.questionCount,
        reason: t.reason,
        rkind: t.reason.includes("Zayıf") ? "red" : t.reason.includes("gündür") ? "amber" : "gray",
        done: t.completed,
      };
    }),
  [plan]);

  const [tasks, setTasks] = useState(initialTasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const dateLabel = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const estHours = plan.estimatedMinutes >= 60
    ? `~${Math.round(plan.estimatedMinutes / 60)} saat`
    : `~${plan.estimatedMinutes} dk`;

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
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
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
