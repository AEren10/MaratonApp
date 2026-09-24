import Animated from "react-native-reanimated";

import { PeriodHero } from "./PeriodHero";
import { MonthPoster } from "./MonthPoster";
import { PeriodBarChart } from "./PeriodBarChart";
import { BestLine } from "./BestLine";
import { NetSpanCard } from "./NetSpanCard";
import { SubjectNetList } from "./SubjectNetList";
import { SignalList } from "./SignalList";
import { SummaryLedger } from "./SummaryLedger";

export function MonthSummaryBody({ data }) {
  const trailing = data.chart.trailing;
  return (
    <>
      <Animated.View>
        {data.layout === "typographic" ? (
          <MonthPoster eyebrow={data.eyebrow} monthName={data.monthName} heroValue={data.hero.value} stats={data.posterStats} />
        ) : (
          <PeriodHero eyebrow={data.eyebrow} headline={data.headline} hero={data.hero} side={data.side} />
        )}
      </Animated.View>
      <BestLine line={data.bestLine} />
      <PeriodBarChart
        label={data.chart.label}
        trailing={trailing}
        trailingTone={trailing && trailing.startsWith("+") ? "up" : "down"}
        bars={data.chart.bars}
      />
      <NetSpanCard span={data.netSpan} />
      <SubjectNetList subjects={data.subjectNets} />
      <SignalList signals={data.signals} />
      <SummaryLedger items={data.ledger} />
    </>
  );
}
