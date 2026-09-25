import { Animated } from "react-native";
import { Button } from "../../../components/design";
import RouteNextActionPanel from "../../roadmap/components/RouteNextActionPanel";
import { STEP } from "../../../themes/tokens";

export function StudySummaryActions({
  C,
  wrongCount,
  onAddWrong,
  nextRouteAction,
  startNextRouteAction,
  onDismiss,
}) {
  return (
    <Animated.View style={{ gap: STEP.s2, marginTop: STEP.s4, paddingBottom: STEP.s4 }}>
      {wrongCount > 0 ? (
        <Button onPress={onAddWrong} variant="outline" fullWidth>
          Yanlışları deftere ekle
        </Button>
      ) : null}
      {nextRouteAction ? (
        <RouteNextActionPanel
          C={C}
          action={nextRouteAction}
          disabled={false}
          onStart={startNextRouteAction}
        />
      ) : null}
      <Button onPress={onDismiss} variant={nextRouteAction ? "outline" : "primary"} fullWidth>
        {nextRouteAction ? "Ana sayfaya dön" : "Devam Et"}
      </Button>
    </Animated.View>
  );
}
