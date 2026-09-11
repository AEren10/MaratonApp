export const DAILY_PLAN_SUMMARY_VERSION = "daily-plan-summary-v1";

const CONFIDENCE_SCORE = Object.freeze({ high: 3, medium: 2, low: 1 });
const CONFIDENCE_LEVELS = Object.freeze([
  { min: 2.6, level: "high", label: "yüksek" },
  { min: 1.6, level: "medium", label: "orta" },
  { min: 0, level: "low", label: "başlangıç" },
]);

function formatEffort(minutes = 0) {
  const rounded = Math.round(Number(minutes) || 0);
  if (rounded >= 60) return `~${Math.round(rounded / 60)} saat`;
  return `~${rounded} dk`;
}

function taskTopic(task = {}) {
  return task.topicLabel || task.topic || null;
}

function primaryTaskLabel(task = {}) {
  const topic = taskTopic(task);
  return topic ? `${task.subjectLabel || task.subject} / ${topic}` : (task.subjectLabel || task.subject || "ilk görev");
}

function resolveSource(routeTaskCount, adaptiveTaskCount) {
  if (routeTaskCount > 0 && adaptiveTaskCount > 0) return "mixed";
  if (routeTaskCount > 0) return "route";
  if (adaptiveTaskCount > 0) return "adaptive";
  return "empty";
}

function resolveConfidence(tasks = [], routeTaskCount = 0) {
  if (!routeTaskCount) {
    return { confidenceLevel: null, confidenceLabel: "veri topluyor" };
  }
  const scores = tasks
    .filter((task) => task.assignment?.source === "route" || task.routeStopId)
    .map((task) => CONFIDENCE_SCORE[task.routeConfidence] || CONFIDENCE_SCORE.low);
  const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length);
  const fallback = CONFIDENCE_LEVELS[CONFIDENCE_LEVELS.length - 1];
  const match = CONFIDENCE_LEVELS.find((item) => average >= item.min) || fallback;
  return { confidenceLevel: match.level, confidenceLabel: match.label };
}

function titleForSource(source) {
  if (source === "route") return "Bugünkü rota hamlesi hazır";
  if (source === "mixed") return "Rota ve adaptif plan birleşti";
  if (source === "adaptive") return "Bugünün adaptif programı hazır";
  return "Bugünkü plan için veri bekliyoruz";
}

function buildBody({ source, taskCount, totalQuestions, effort, primaryTask }) {
  if (source === "empty") {
    return "Hedef, deneme veya rota verisi geldikçe günlük program kişiselleşecek.";
  }
  const prefix = `${taskCount} görev · ${totalQuestions} soru · ${effort}`;
  if (source === "route") return `${prefix}. İlk hamle: ${primaryTaskLabel(primaryTask)}.`;
  if (source === "mixed") return `${prefix}. Rota önceliği korunur, boşluklar adaptif görevle tamamlanır.`;
  return `${prefix}. Zayıflık, ihmal ve sınava kalan süre sinyalleriyle dengelendi.`;
}

function buildNextAction({ source, primaryTask }) {
  if (source === "empty") return "İlk hedef veya deneme kaydını ekle; rota motoru programı netleştirsin.";
  const label = primaryTaskLabel(primaryTask);
  if (source === "route" || source === "mixed") {
    return `Önce ${label} durağını bitir; tamamlanınca rota geçmişine işlenecek.`;
  }
  return `Önce ${label} görevini bitir; yeni kayıtlar geldikçe program keskinleşir.`;
}

function underfilledRiskLevel(totalQuestions = 0, dailyTarget = 0) {
  const missing = Math.max(0, Math.round(Number(dailyTarget) || 0) - Math.round(Number(totalQuestions) || 0));
  const target = Math.max(1, Math.round(Number(dailyTarget) || 0));
  if (!missing) return null;
  return missing / target >= 0.25 ? "medium" : "low";
}

function collectRisks({
  source,
  routeTaskCount,
  confidenceLevel,
  totalQuestions = 0,
  dailyTarget = 0,
}) {
  const risks = [];
  if (source === "empty") risks.push({ code: "plan_data_missing", level: "medium" });
  if (source === "adaptive") risks.push({ code: "route_not_attached", level: "low" });
  if (routeTaskCount > 0 && confidenceLevel === "low") {
    risks.push({ code: "route_signal_sparse", level: "medium" });
  }
  const underfilledLevel = underfilledRiskLevel(totalQuestions, dailyTarget);
  if (underfilledLevel) {
    risks.push({
      code: "plan_underfilled",
      level: underfilledLevel,
      missingQuestions: Math.max(0, Math.round(Number(dailyTarget) || 0) - Math.round(Number(totalQuestions) || 0)),
    });
  }
  return risks;
}

export function buildDailyPlanSummary({
  tasks = [],
  totalQuestions = 0,
  estimatedMinutes = 0,
  dailyTarget = 0,
} = {}) {
  const routeTaskCount = tasks.filter((task) => task.assignment?.source === "route" || task.routeStopId).length;
  const adaptiveTaskCount = Math.max(0, tasks.length - routeTaskCount);
  const source = resolveSource(routeTaskCount, adaptiveTaskCount);
  const primaryTask = tasks[0] || null;
  const confidence = resolveConfidence(tasks, routeTaskCount);
  const effort = formatEffort(estimatedMinutes);

  return {
    version: DAILY_PLAN_SUMMARY_VERSION,
    source,
    title: titleForSource(source),
    body: buildBody({ source, taskCount: tasks.length, totalQuestions, effort, primaryTask }),
    nextAction: buildNextAction({ source, primaryTask }),
    confidenceLabel: confidence.confidenceLabel,
    confidenceLevel: confidence.confidenceLevel,
    effort,
    totalTasks: tasks.length,
    routeTaskCount,
    adaptiveTaskCount,
    totalQuestions,
    targetQuestions: Math.max(0, Math.round(Number(dailyTarget) || 0)),
    missingQuestions: Math.max(0, Math.round(Number(dailyTarget) || 0) - Math.round(Number(totalQuestions) || 0)),
    estimatedMinutes: Math.round(Number(estimatedMinutes) || 0),
    primaryTaskKey: primaryTask?.planTaskKey || null,
    primarySubject: primaryTask?.subject || null,
    primaryTopic: primaryTask ? taskTopic(primaryTask) : null,
    risks: collectRisks({
      source,
      routeTaskCount,
      confidenceLevel: confidence.confidenceLevel,
      totalQuestions,
      dailyTarget,
    }),
  };
}
