import { Fragment } from "react";
import { Line, Text as SvgText } from "react-native-svg";

import { EFFORT_PAD_LEFT, PAD_RIGHT, gridSteps } from "../chartStyle";

// Sol eksen (SURE). 2 saati gecen olcekte kademeler saat ("1s", "2s"),
// altinda dakika ("30d"). Izgara cubuklarin ARKASINDA, soluk.
export function EffortGrid({ chartMax, yOf, width, C }) {
  const inHours = chartMax >= 120;
  const steps = inHours ? gridSteps(chartMax / 60).map((h) => h * 60) : gridSteps(chartMax);
  return steps.map((v) => {
    const gy = yOf(v);
    return (
      <Fragment key={`grid-${v}`}>
        <Line x1={EFFORT_PAD_LEFT} y1={gy} x2={width - PAD_RIGHT} y2={gy} stroke={C.line} strokeWidth={1} strokeOpacity={0.55} />
        <SvgText x={EFFORT_PAD_LEFT - 6} y={gy + 3.5} fill={C.text4} fontSize={11} textAnchor="end">
          {inHours ? `${Math.round(v / 60)}s` : `${v}d`}
        </SvgText>
      </Fragment>
    );
  });
}
