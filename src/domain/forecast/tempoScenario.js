import { forecastNetValue } from "../../lib/netForecast.js";

export const TEMPO_MULTIPLIERS = Object.freeze([0.9, 1, 1.1]);
const MS_DAY = 86400000;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round = (value, digits = 1) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};
const validDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};
const trialDate = (trial) => validDate(trial.date || trial.trial_date);
const trialType = (trial) => String(
  trial.trialType || trial.exam_type || "UNKNOWN",
).toUpperCase();

function tempoSlope(trials, studyLogs, expectedType) {
  const ordered = (trials || []).filter((trial) => (
    trialDate(trial) && forecastNetValue(trial) != null
    && (!expectedType || trialType(trial) === expectedType)
  )).sort((a, b) => trialDate(a) - trialDate(b)).slice(-5);
  const samples = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const start = trialDate(ordered[index - 1]);
    const end = trialDate(ordered[index]);
    const weeks = (end - start) / MS_DAY / 7;
    if (!(weeks > 0)) continue;
    const questions = (studyLogs || []).reduce((sum, log) => {
      const date = validDate(log.study_date || log.studyDate);
      if (!date || date <= start || date > end) return sum;
      const count = Number(log.question_count ?? log.questionCount ?? 0);
      return sum + (Number.isFinite(count) && count > 0 ? count : 0);
    }, 0);
    if (!questions) continue;
    samples.push({
      x: questions / weeks,
      y: (forecastNetValue(ordered[index])
        - forecastNetValue(ordered[index - 1])) / weeks,
    });
  }
  if (samples.length < 3) return null;
  const meanX = samples.reduce((sum, item) => sum + item.x, 0) / samples.length;
  const meanY = samples.reduce((sum, item) => sum + item.y, 0) / samples.length;
  const sxx = samples.reduce((sum, item) => sum + (item.x - meanX) ** 2, 0);
  if (!sxx) return null;
  const slope = samples.reduce(
    (sum, item) => sum + (item.x - meanX) * (item.y - meanY), 0,
  ) / sxx;
  const intercept = meanY - slope * meanX;
  const ssRes = samples.reduce(
    (sum, item) => sum + (item.y - (intercept + slope * item.x)) ** 2, 0,
  );
  const ssTot = samples.reduce((sum, item) => sum + (item.y - meanY) ** 2, 0);
  const r2 = ssTot ? 1 - ssRes / ssTot : 0;
  if (!(slope > 0) || r2 < 0.15) return null;
  return { slope, r2, sampleSize: samples.length };
}

function minutesPerQuestion(logs) {
  let questions = 0;
  let minutes = 0;
  for (const log of logs || []) {
    const q = Number(log.question_count ?? log.questionCount ?? 0);
    const m = Number(log.duration_minutes ?? log.duration ?? 0);
    if (q > 0 && m > 0) {
      questions += q;
      minutes += m;
    }
  }
  return questions ? clamp(minutes / questions, 0.25, 6) : 1.5;
}

export function simulateTempoScenario({
  forecast, multiplier, questionsPerWeek, stopsPerWeek = 0,
  trials = [], studyLogs = [], examDate, maxNet = Infinity,
  now = new Date(), model = null,
} = {}) {
  if (!forecast || !TEMPO_MULTIPLIERS.includes(multiplier)) return null;
  const baseQuestions = Math.max(1, Number(questionsPerWeek) || 1);
  const scenarioQuestions = Math.max(1, Math.round(baseQuestions * multiplier));
  const daysLeft = Math.max(0, (new Date(examDate) - now) / MS_DAY);
  const weeksLeft = daysLeft / 7;
  const baselineGain = Math.max(0, forecast.projected - forecast.current);
  const fitted = model ?? tempoSlope(trials, studyLogs, forecast.trialType);
  const rawDelta = fitted
    ? fitted.slope * (scenarioQuestions - baseQuestions) * weeksLeft
    : baselineGain * (multiplier - 1);
  const margin = Math.max(0, forecast.predictionInterval?.margin ?? 0);
  const maxEffect = Math.max(0.5, margin, baselineGain * 0.5);
  const delta = multiplier === 1 ? 0 : clamp(rawDelta, -maxEffect, maxEffect);
  const projectedNet = clamp(forecast.projected + delta, 0, maxNet);
  const actualDelta = projectedNet - forecast.projected;
  const minuteDelta = (scenarioQuestions - baseQuestions)
    * minutesPerQuestion(studyLogs) / 7;
  return {
    id: multiplier < 1 ? "less" : multiplier > 1 ? "more" : "current",
    multiplier, questionsPerWeek: scenarioQuestions,
    stopsPerWeek: stopsPerWeek > 0
      ? Math.max(1, Math.round(stopsPerWeek * multiplier)) : 0,
    minutesPerDayDelta: round(minuteDelta),
    projectedNet: round(projectedNet), deltaNet: round(actualDelta),
    range: {
      low: round(clamp(projectedNet - margin, 0, maxNet)),
      high: round(clamp(projectedNet + margin, 0, maxNet)),
    },
    confidence: fitted
      ? (fitted.r2 >= 0.6 && fitted.sampleSize >= 4 ? "high" : "medium")
      : "low",
    model: fitted ? "observed_question_response" : "trend_elasticity",
    valueBasis: forecast.valueBasis,
  };
}

export function buildTempoScenarios(options = {}) {
  if (!options.forecast) return [];
  const model = tempoSlope(
    options.trials, options.studyLogs, options.forecast.trialType,
  );
  return TEMPO_MULTIPLIERS.map((multiplier) => simulateTempoScenario({
    ...options, multiplier, model,
  }));
}
