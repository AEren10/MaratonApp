import Animated from "react-native-reanimated";

import { formatSignedPct } from "../../../../domain/summary/summaryFormat";
import { SummaryTaskList } from "../SummaryTaskList";
import { SummaryRouteImpact } from "../SummaryRouteImpact";
import { PeriodHero } from "./PeriodHero";
import { PeriodBarChart } from "./PeriodBarChart";
import { SummaryShareRow } from "./SummaryShareRow";
import { SummaryLedger } from "./SummaryLedger";

export function DaySummaryBody({ data, onShare }) {
  const recent = data.recent;
  const stopsStat = data.side?.find((s) => s.label === "DURAK");
  const stopsCount = Number(stopsStat?.value || 0);
  const totalQuestions = Number(data.hero?.value || 0);

  let hero = data.hero;
  let side = data.side;

  if (totalQuestions === 0) {
    if (stopsCount > 0) {
      hero = { value: String(stopsCount), label: "TAMAMLANAN DURAK" };
      side = (data.side || []).filter((s) => s.label !== "DURAK");
    } else {
      hero = null;
    }
  }

  const shareVal = hero ? `${hero.value} ${hero.label?.split(" · ")[0] || ""}`.trim() : "Günün Özeti";

  return (
    <>
      <Animated.View>
        <PeriodHero headline={data.headline} hero={hero} side={side} />
      </Animated.View>
      <SummaryShareRow value={shareVal} onPress={onShare} />
      {recent ? (
        <PeriodBarChart
          label="SON 7 GÜN · SORU"
          trailing={formatSignedPct(recent.deltaPct)}
          trailingTone={recent.deltaPct >= 0 ? "up" : "down"}
          bars={recent.bars}
          average={recent.average || null}
        />
      ) : null}
      <SummaryTaskList tasks={data.tasks} />
      <SummaryRouteImpact impact={data.routeImpact} />
      <SummaryLedger items={data.ledger} />
    </>
  );
}
