import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useStudyRoute } from "./useStudyRoute";
import { useExam } from "../contexts/ExamContext";
import { SCREENS } from "../constants/screens";
import { buildPlanVsActual } from "../domain/route/planVsActual";
import { buildGapClosureOptions, GAP_OPTION } from "../domain/route/gapClosureOptions";
import { numberWord, ordinalWord } from "../lib/trWords";

const cap = { capital: true };

// BOSLUGU KAPATMA PLANI — Plan vs Gercek'in "Boşluğu kapatma planı" ucu.
// Uygula: "Hedefi gerçeğe çek" hedef neti gercekten gunceller; diger iki
// yol gecilmeyen duraklari sonraki haftalara tasiyan Konu Borcu dagitimina
// gider (rota motoru haftaya ek durak eklemeyi desteklemiyor).
export function useGapClosure() {
  const navigation = useNavigation();
  const { weeks, currentWeek, forecast } = useStudyRoute({ persist: false });
  const { targetNet, baselineNet, updateTargetNet } = useExam();
  const [choice, setChoice] = useState(GAP_OPTION.ADD);
  const [applying, setApplying] = useState(false);

  const data = useMemo(() => buildPlanVsActual(weeks || []), [weeks]);
  const o = useMemo(() => buildGapClosureOptions({
    gap: data.gap,
    plannedDue: data.plannedDue,
    doneDue: data.doneDue,
    elapsedWeeks: data.series.filter((p) => p.elapsed).length,
    remainingWeeks: data.series.filter((p) => !p.elapsed).length,
    weekStops: currentWeek?.stops?.length ?? null,
    targetNet: targetNet != null ? Number(targetNet) : null,
    currentNet: forecast?.current ?? (baselineNet != null ? Number(baselineNet) : null),
  }), [data, currentWeek, targetNet, baselineNet, forecast]);

  const copy = useMemo(() => {
    if (!o) return null;
    const weeksWord = o.closeWeeks != null ? numberWord(o.closeWeeks, cap) : null;
    const add = [
      weeksWord && o.weekStopsAfter != null ? `${weeksWord} hafta boyunca haftada ${o.weekStopsAfter} durak.` : null,
      o.targetNet != null ? `Hedef net ${o.targetNet} kalır.` : null,
    ].filter(Boolean).join(" ");
    const target = o.reducedTarget != null
      ? `Haftalık yük aynı kalır, hedef ${o.targetNet} yerine ${o.reducedTarget} nete iner.`
      : "Haftalık yük aynı kalır.";
    const closes = weeksWord
      ? `${weeksWord} hafta sonunda boşluk kapanır. ${ordinalWord(o.closeWeeks + 1, cap)} haftadan itibaren eski tempoya dönersin.`
      : null;
    return {
      headline: `${numberWord(o.gap, cap)} durak geride kaldın.`,
      lede: `Son ${numberWord(o.elapsedWeeks)} haftada plan ${o.plannedDue} durak dedi, ${o.doneDue} durak oldu. Üç yol var.`,
      options: [
        { key: GAP_OPTION.ADD, title: "Haftaya bir durak ekle", body: add },
        { key: GAP_OPTION.WEEKEND, title: "Hafta sonuna yığ", body: "Hafta içi aynı, cumartesi iki durak. Serinin riski artar." },
        { key: GAP_OPTION.TARGET, title: "Hedefi gerçeğe çek", body: target, disabled: o.reducedTarget == null },
      ],
      resultBody: choice === GAP_OPTION.TARGET ? null : closes,
    };
  }, [o, choice]);

  const apply = useCallback(async () => {
    if (choice !== GAP_OPTION.TARGET) {
      navigation.navigate(SCREENS.TOPIC_DEBT);
      return;
    }
    if (o?.reducedTarget == null || applying) return;
    setApplying(true);
    try {
      await updateTargetNet(o.reducedTarget);
      navigation.goBack();
    } finally {
      setApplying(false);
    }
  }, [choice, o, applying, updateTargetNet, navigation]);

  return {
    hasGap: Boolean(o),
    copy,
    choice,
    setChoice,
    result: o ? o.resultFor(choice) : null,
    applying,
    apply,
    close: () => navigation.goBack(),
  };
}
