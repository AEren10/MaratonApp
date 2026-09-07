import { Pressable, Text, View } from "react-native";

import { Icon, IconBox, GlassCard } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { TodayPlanCard } from "./TodayPlanCard";

export function HomePlanSection({
  C,
  dailyAction,
  generatedTasks,
  onAddTask,
  onAllDone,
  onReview,
  onStartTask,
  onTaskDone,
  onViewPlan,
  plan,
  srDue,
}) {
  return (
    <View style={{ marginTop: SPACING.xxl, gap: SPACING.sm }}>
      <AnimatedCard delay={40}>
        <TodayPlanCard
          generatedTasks={generatedTasks}
          aiSuggestion={dailyAction}
          planSummary={plan}
          onViewAll={onViewPlan}
          onAddTask={onAddTask}
          onStart={onStartTask}
          onTaskDone={onTaskDone}
          onAllDone={onAllDone}
        />
      </AnimatedCard>

      {srDue > 0 ? (
        <AnimatedCard delay={80}>
          <Pressable
            onPress={onReview}
            accessibilityRole="button"
            accessibilityLabel={`${srDue} yanlışın tekrar zamanı geldi`}
            accessibilityHint="Tekrar oturumuna gider"
          >
            <GlassCard
              radius={RADIUS.xxl}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.md,
                padding: SPACING.lg,
                backgroundColor: C.coral + "14",
                borderColor: C.coral + "28",
              }}
            >
              <IconBox icon="refresh" color={C.coral} size={44} rounded={RADIUS.md} />
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPOGRAPHY.label, color: C.coral }}>BUGÜN TEKRAR</Text>
                <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, marginTop: 2 }}>
                  {srDue} yanlışın tekrar zamanı geldi
                </Text>
              </View>
              <Icon name="arrowR" size={18} color={C.coral} />
            </GlassCard>
          </Pressable>
        </AnimatedCard>
      ) : null}
    </View>
  );
}
