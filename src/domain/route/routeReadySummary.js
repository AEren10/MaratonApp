export function resolveRouteReadyCurrentNet(latestTrial, baselineNet) {
  const trialNet = latestTrial?.normalizedTotalNet ?? latestTrial?.totalNet;
  const numericTrialNet = trialNet == null ? null : Number(trialNet);
  if (Number.isFinite(numericTrialNet)) return numericTrialNet;

  const numericBaselineNet = baselineNet == null ? null : Number(baselineNet);
  return Number.isFinite(numericBaselineNet) ? numericBaselineNet : null;
}
