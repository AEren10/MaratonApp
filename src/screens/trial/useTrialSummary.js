import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../../contexts/ExamContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getAllSubjects, getTrialTypes } from "../../domain/trial/trialTypes";
import { forecastNet } from "../../lib/netForecast";
import { numberWithCase, withCase } from "../../lib/turkishSuffix";

const netOf = (trial) => Number(trial?.rawTotalNet ?? trial?.totalNet ?? 0);

function isSameEntry(a, b) {
  if (a.id === b.id) return true;
  return a.date === b.date && a.name === b.name && Math.abs(netOf(a) - netOf(b)) < 0.001;
}

function subjectsFor(trial, C) {
  if (trial.trialType === "BRANCH" && trial.branchSubject) {
    return getAllSubjects(C).filter((s) => s.key === trial.branchSubject);
  }
  return getTrialTypes(C)[trial.trialType]?.subjects || [];
}

export function useTrialSummary({ trial, C }) {
  const trials = useSelector(selectTrials);
  const { examDate } = useExam();

  return useMemo(() => {
    if (!trial) return null;
    const subjects = subjectsFor(trial, C);
    const totalMax = subjects.reduce((sum, s) => sum + s.max, 0);
    const sameType = (trials || []).filter((t) => t.trialType === trial.trialType
      && (trial.trialType !== "BRANCH" || t.branchSubject === trial.branchSubject));
    const stored = sameType.find((t) => isSameEntry(t, trial)) || trial;
    const others = sameType
      .map((t, index) => ({ trial: t, orderIndex: index }))
      .filter(({ trial: t }) => t !== stored && !isSameEntry(t, trial))
      .sort((a, b) => {
        const diff = new Date(a.trial.date) - new Date(b.trial.date);
        if (diff !== 0) return diff;
        const timeA = a.trial.created_at || a.trial.createdAt ? new Date(a.trial.created_at || a.trial.createdAt).getTime() : (Number(a.trial.id) > 1e9 ? Number(a.trial.id) : 0);
        const timeB = b.trial.created_at || b.trial.createdAt ? new Date(b.trial.created_at || b.trial.createdAt).getTime() : (Number(b.trial.id) > 1e9 ? Number(b.trial.id) : 0);
        if (timeA !== timeB) return timeA - timeB;
        return b.orderIndex - a.orderIndex;
      })
      .map(({ trial: t }) => t);
    const prev = others[others.length - 1] || null;
    const net = netOf(trial);
    const delta = prev ? net - netOf(prev) : null;

    const bars = subjects.map((s) => {
      const current = trial.subjects?.[s.key]?.net || 0;
      const before = prev?.subjects?.[s.key]?.net;
      return {
        key: s.key, name: s.name, color: s.color, max: s.max, net: current,
        correct: trial.subjects?.[s.key]?.correct || 0,
        wrong: trial.subjects?.[s.key]?.wrong || 0,
        c: s.color, delta: prev && before != null ? current - before : null,
      };
    });
    const totalWrong = bars.reduce((sum, b) => sum + b.wrong, 0);

    let forecast = null;
    if (examDate && others.length + 1 >= 4) {
      const withNew = [...others, stored];
      const before = forecastNet(others, examDate, totalMax || null, trial.trialType);
      const after = forecastNet(withNew, examDate, totalMax || null, trial.trialType);
      if (before && after) forecast = { before: Math.round(before.projected), after: Math.round(after.projected) };
    }

    let sentence = null;
    if (forecast && forecast.after > forecast.before) {
      sentence = "Tahmin " + numberWithCase(forecast.before, "ablative") + " " + numberWithCase(forecast.after, "dative") + " çıktı.";
      const top = bars.filter((b) => b.delta > 0).sort((a, b) => b.delta - a.delta)[0];
      if (top && bars.length > 1) sentence += " " + withCase(top.name, "locative") + "ki artış rotayı yukarı çekti.";
    } else if (delta != null && delta > 0) {
      const deltaStr = `+${delta.toFixed(2).replace(".", ",")}`;
      const top = bars.filter((b) => b.delta > 0).sort((a, b) => b.delta - a.delta)[0];
      if (top && bars.length > 1) {
        sentence = `Geçmiş denemeye göre ${deltaStr} net yükseldin. En güçlü artış ${top.name} dersinde gerçekleşti.`;
      } else {
        sentence = `Geçmiş denemeye göre ${deltaStr} net yükseliştesin.`;
      }
    } else if (delta != null && delta === 0) {
      sentence = "Önceki deneme ile aynı net seviyesini korudun.";
    } else if (delta == null && !prev) {
      sentence = "İlk denemen kaydedildi. İkinci denemeyle birlikte net gelişimin hesaplanacak.";
    }

    const prevNet = prev ? netOf(prev) : null;
    const route = prev ? {
      startNet: netOf(others[0]), prevNet, newNet: net, forecast,
    } : null;

    const typeName = getTrialTypes(C)[trial.trialType]?.label || trial.trialType;
    return {
      typeName,
      subjects,
      bars,
      prev,
      prevNet,
      net,
      delta,
      totalWrong,
      route,
      hasChart: Boolean(route),
      sentence,
      sameTypeCount: others.length + 1,
    };
  }, [trial, trials, C, examDate]);
}
