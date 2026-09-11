export function routeStateBelongsToExam(routeState = null, examType = null) {
  if (!routeState?.exam_type || !examType) return true;
  return routeState.exam_type === examType;
}

export function isRoutePausedForExam(routeState = null, examType = null) {
  if (!routeStateBelongsToExam(routeState, examType)) return false;
  return Boolean(routeState?.paused_at && (
    !routeState?.resumed_at || new Date(routeState.paused_at) > new Date(routeState.resumed_at)
  ));
}

export function routePausedAtForExam(routeState = null, examType = null) {
  return isRoutePausedForExam(routeState, examType) ? routeState.paused_at : null;
}
