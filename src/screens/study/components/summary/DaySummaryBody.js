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
  return (
    <>
      <Animated.View>
        <PeriodHero headline={data.headline} hero={data.hero} side={data.side} />
      </Animated.View>
      <SummaryShareRow value={data.hero.value} onPress={onShare} />
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
