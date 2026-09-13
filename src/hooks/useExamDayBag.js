import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { bagItems, venueLine } from "../domain/exam/examDayPlan";
import { loadExamDayPlan, writeExamDayPlan } from "../lib/examDayPlanStore";
import * as H from "../lib/haptics";

// Ana Sayfa "Sınav Günü" modu: canta listesi ve sinav yeri, kullanicinin
// Sınav günü planı ekraninda girdiklerinden. Plan yoksa hicbir kalem
// isaretli gelmez, sinav yeri karti cizilmez.
export function useExamDayBag() {
  const { user } = useAuth();
  const focused = useIsFocused();
  const userId = user?.id;
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!focused) return undefined;
    let alive = true;
    loadExamDayPlan(userId)
      .then(({ plan: p }) => { if (alive) setPlan(p); })
      .catch(() => {});
    return () => { alive = false; };
  }, [focused, userId]);

  const toggle = useCallback((key) => {
    if (!plan) return;
    H.select();
    const checked = { ...plan.checked };
    if (checked[key]) delete checked[key];
    else checked[key] = true;
    const next = { ...plan, checked };
    setPlan(next);
    writeExamDayPlan(userId, next).catch(() => {});
  }, [plan, userId]);

  return {
    items: plan ? bagItems(plan) : bagItems(null),
    venue: plan ? venueLine(plan) : null,
    place: plan?.venue?.trim() || null,
    toggle,
  };
}
