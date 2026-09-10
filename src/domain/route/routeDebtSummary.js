function formatMinutes(minutes = 0) {
  const rounded = Math.round(Number(minutes) || 0);
  if (rounded >= 60) return `~${Math.round(rounded / 60)} sa`;
  return rounded > 0 ? `~${rounded} dk` : null;
}

function formatWeeks(value = 0) {
  const weeks = Math.round((Number(value) || 0) * 10) / 10;
  return weeks > 0 ? `${weeks} hafta` : "bu hafta";
}

export function buildRouteDebtSummary({ debt = null, debtPlan = null, debtWeeks = 0 } = {}) {
  if (!debt?.hasDebt || debt.totalQuestions <= 0) return null;
  const effort = formatMinutes(debt.totalMinutes) || `${debt.totalQuestions} soru`;
  const uncovered = Math.max(0, Math.round(Number(debtPlan?.uncovered) || 0));
  const assigned = Math.max(0, Math.round(Number(debtPlan?.assigned) || 0));
  const cappedText = debt.capped
    ? ` Eski borç ${debt.originalQuestions} sorudan ${debt.totalQuestions} soruya tavanlandı.`
    : "";
  const uncoveredText = uncovered > 0
    ? ` ${uncovered} soru kapasiteyi aşmamak için açıkta tutuldu.`
    : " Kalan haftalara kapasiteyi aşmadan dağıtılabilir.";

  return {
    title: "Konu borcu kontrol altında",
    body: `Plan kaçan işi ceza gibi büyütmez; gerçek tempoya göre kapatır.${cappedText}${uncoveredText}`,
    stats: [
      { label: "Borç", value: effort },
      { label: "Denk", value: formatWeeks(debtWeeks) },
      { label: "Dağıtılan", value: assigned > 0 ? `${assigned} soru` : "bekliyor" },
    ],
    capped: Boolean(debt.capped),
    uncovered,
  };
}
