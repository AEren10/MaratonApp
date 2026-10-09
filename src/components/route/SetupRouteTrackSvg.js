import { memo } from "react";
import Svg, { Line, Circle, G } from "react-native-svg";
import Animated from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);

export const TRACK_H = 24;
export const NODE_R = 6.5;

export const SetupRouteTrackSvg = memo(function SetupRouteTrackSvg({
  steps,
  current,
  cardWidth,
  C,
  liveProps,
  xOf,
  segLen,
}) {
  return (
    <Svg width={cardWidth} height={TRACK_H}>
      {steps.slice(1).map((step, i) => {
        const x1 = xOf(i) + NODE_R;
        const x2 = xOf(i + 1) - NODE_R;
        const done = i + 1 < current;
        const live = i + 1 === current;
        return (
          <Line
            key={step}
            x1={x1}
            y1={TRACK_H / 2}
            x2={x2}
            y2={TRACK_H / 2}
            stroke={done ? C.accent : C.track}
            strokeWidth={done ? 2.5 : 1.5}
            strokeDasharray={done || live ? undefined : "3 4"}
            strokeLinecap="round"
          />
        );
      })}
      {current > 0 ? (
        <AnimatedLine
          x1={xOf(current - 1) + NODE_R}
          y1={TRACK_H / 2}
          x2={xOf(current) - NODE_R}
          y2={TRACK_H / 2}
          stroke={C.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={segLen}
          animatedProps={liveProps}
        />
      ) : null}
      {steps.map((step, i) => {
        const cx = xOf(i);
        const cy = TRACK_H / 2;
        const isCurrent = i === current;
        const isDone = i < current;

        return (
          <G key={step}>
            {isCurrent ? (
              <Circle cx={cx} cy={cy} r={12} fill={C.accent} fillOpacity={0.16} />
            ) : null}
            <Circle
              cx={cx}
              cy={cy}
              r={isCurrent ? NODE_R : isDone ? NODE_R - 0.5 : NODE_R - 1.5}
              fill={isCurrent || isDone ? C.accent : C.bg}
              stroke={isCurrent ? C.accentInk : isDone ? C.accent : C.border}
              strokeWidth={isCurrent ? 2 : 1.5}
            />
            {isCurrent || isDone ? (
              <Circle cx={cx} cy={cy} r={2} fill="#FFFFFF" />
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
});
