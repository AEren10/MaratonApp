import { useMemo, useEffect } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, GlowBackground, WARM_GLOW } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { TYPOGRAPHY } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { generateDailyPlan } from "../../lib/planEngine";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useAppSelector } from "../../store/hooks";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectAdHocTasks } from "../../store/slices/planSlice";
import { selectUserTasks } from "../../store/slices/userTasksSlice";
import { useAuth } from "../../contexts/AuthContext";
import { useUserTasks } from "../../hooks/useUserTasks";
import { usePlanCompletion } from "../../hooks/usePlanCompletion";
import { usePlanContext } from "../../hooks/usePlanContext";
import { PlanHeader } from "./components/PlanHeader";
import { PlanTaskItem } from "./components/PlanTaskItem";
import { TaskReasonSheet } from "./components/TaskReasonSheet";
import { useAlert } from "../../contexts/AlertContext";
import { makePlanDetailStyles } from "./planDetailStyles";
import { usePlanDetailTasks } from "./usePlanDetailTasks";

export default function PlanDetailScreen() {
  const C = useC();
  const styles = useMemo(() => makePlanDetailStyles(C), [C]);
  const navigation = useNavigation();
  const showAlert = useAlert();
  const { user } = useAuth();
  const trials = useAppSelector(selectTrials);
  const adHocTasks = useAppSelector(selectAdHocTasks);
  const userTasks = useAppSelector(selectUserTasks);
  const { toggleTask: toggleUserTask } = useUserTasks();
  const { isDone: isPlanDone, toggle: togglePlanDone, syncPlan } = usePlanCompletion(user?.id);
  const ctx = usePlanContext();
  // Günlük plan haftalık rotadan besleniyor — ikisi çelişmesin diye.
  // persist: false çünkü bu ekran rotayı ÇİZMİYOR, sadece okuyor.
  const { currentWeek, transitionStop } = useStudyRoute({ persist: false });

  const plan = useMemo(
    () => generateDailyPlan({ ...ctx, routeWeekStops: currentWeek?.stops || [] }),
    [ctx, currentWeek],
  );

  useEffect(() => {
    if (plan?.tasks?.length) syncPlan(plan);
  }, [plan, syncPlan]);

  const {
    doneCount, reasonTask, setReasonTask, showReason,
    startTask, tasks, toggleTask,
  } = usePlanDetailTasks({
    C,
    plan,
    adHocTasks,
    userTasks,
    isPlanDone,
    navigation,
    showAlert,
    togglePlanDone,
    toggleUserTask,
    transitionStop,
  });
  const dateLabel = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const estHours = plan.estimatedMinutes >= 60
    ? `~${Math.round(plan.estimatedMinutes / 60)} saat`
    : `~${plan.estimatedMinutes} dk`;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.title}>Günlük Plan</Text>
        <Pressable onPress={() => navigation.navigate(SCREENS.ADD_TASK)} hitSlop={12} style={styles.addBtn}>
          <Icon name="plus" size={18} color={C.accent} sw={2.5} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(420).springify()}>
          <PlanHeader
            done={doneCount}
            total={tasks.length}
            soru={plan.totalQuestions}
            hours={estHours}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(420).springify()}>
          <View style={styles.listLabel}>
            <Icon name="layers" size={16} color={C.sec} />
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec }}>
              Görevler
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
            style={({ pressed }) => [
              styles.addRow,
              { borderColor: C.accent + "50", opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.addIcon, { backgroundColor: C.accent }]}>
              <Icon name="plus" size={14} color={C.textOnFill} sw={2.5} />
            </View>
            <Text style={[styles.addText, { color: C.accent }]}>Görev Ekle</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
          {tasks.length === 0 ? (
            <EmptyState
              icon="layers"
              title="Bugünkü planın hazır değil"
              message="Hedeflerini ve deneme sonuçlarını girdikçe kişiselleştirilmiş planın oluşacak. İlk görevi eklemek 10 saniye sürer!"
              actionLabel="Görev Ekle"
              onAction={() => navigation.navigate(SCREENS.ADD_TASK)}
              color="accent"
            />
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => (
                <PlanTaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onStart={startTask}
                  onInfo={showReason}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <TaskReasonSheet task={reasonTask} trials={trials} onClose={() => setReasonTask(null)} />
    </SafeAreaView>
  );
}
