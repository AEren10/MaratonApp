import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { selectTrials } from "../store/slices/trialSlice";
import { weekTrialPlan } from "../domain/exam/trialSchedule";
import { getAllSubjects, getLGSSubjects, getYDTSubjects } from "../domain/trial/trialTypes";
import { startOfWeekTR, todayTR } from "../lib/dateUtils";
import { addDays } from "../domain/program/dayKeys";

const LABELS = Object.fromEntries([...getAllSubjects(), ...getLGSSubjects(), ...getYDTSubjects()].map((s) => [s.key, s.name]));
const TYPE_LABEL = { TYT: "TYT denemesi", AYT_SAY: "AYT sayısal denemesi", AYT_EA: "AYT eşit ağırlık denemesi", AYT_SOZ: "AYT sözel denemesi", YDT: "YDT denemesi", LGS: "LGS denemesi" };
const MINUTES = { TYT: 165, LGS: 155, BRANCH: 40 };

// Bu haftanin deneme onerileri (rota ritmi) + bugunun olanlari, ana sayfa
// durak satiri bicimiyle.
export function useWeekTrialPlan() {
  const trials = useSelector(selectTrials);
  const { examType, field, examDate } = useExam();
  return useMemo(() => {
    const today = todayTR();
    const weekStart = startOfWeekTR().slice(0, 10);
    const weekEnd = addDays(weekStart, 6);
    const daysLeft = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000) : null;
    const plan = weekTrialPlan({ daysLeft, examType, field, trials, weekStart, weekEnd });
    const todayIndex = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
    const asItem = (p) => ({
      id: p.id,
      source: "trial",
      subject: p.branchSubject || null,
      label: p.kind === "branch" ? `${LABELS[p.branchSubject] || "Branş"} branş denemesi` : TYPE_LABEL[p.trialType] || "Deneme",
      topic: p.kind === "branch" ? `${LABELS[p.branchSubject] || "Branş"} branş denemesi` : TYPE_LABEL[p.trialType] || "Deneme",
      badge: p.kind === "branch" ? "Deneme" : null,
      reason: p.reason,
      minutes: MINUTES[p.trialType] || 180,
      count: 0,
      completed: p.done,
      trialType: p.trialType,
      branchSubject: p.branchSubject,
    });
    return { plan, todayItems: plan.filter((p) => p.dayIndex === todayIndex).map(asItem), asItem };
  }, [trials, examType, field, examDate]);
}
