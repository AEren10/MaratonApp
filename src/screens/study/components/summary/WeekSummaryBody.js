import Animated, { FadeInDown } from "react-native-reanimated";

import { PeriodHero } from "./PeriodHero";
import { PeriodBarChart } from "./PeriodBarChart";
import { BestLine } from "./BestLine";
import { PromiseCard } from "./PromiseCard";

export function WeekSummaryBody({ data, onPromise }) {
  return (
    <>
      <Animated.View entering={FadeInDown.delay(60).duration(500)}>
        <PeriodHero eyebrow={data.eyebrow} headline={data.headline} hero={data.hero} side={data.side} />
      </Animated.View>
      <BestLine line={data.bestLine} />
      <PeriodBarChart label={data.chart.label} trailing={data.chart.trailing} bars={data.chart.bars} />
      <PromiseCard promise={data.promise} onPress={onPromise} />
    </>
  );
}
