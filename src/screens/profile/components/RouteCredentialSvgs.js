import React from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";

export function TargetSvg({ color, bg }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={22} fill={bg} />
      <Circle cx={23} cy={23} r={15} stroke={color} strokeWidth={1.8} fill="none" opacity={0.35} />
      <Circle cx={23} cy={23} r={9} stroke={color} strokeWidth={2} fill="none" />
      <Circle cx={23} cy={23} r={3.5} fill={color} />
      <Line x1={23} y1={5} x2={23} y2={10} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={23} y1={36} x2={23} y2={41} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={5} y1={23} x2={10} y2={23} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={36} y1={23} x2={41} y2={23} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockSvg({ color, bg }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={22} fill={bg} />
      <Circle cx={23} cy={23} r={14} stroke={color} strokeWidth={2} fill="none" />
      <Line x1={23} y1={14} x2={23} y2={23} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={23} y1={23} x2={29} y2={23} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={23} cy={23} r={2.5} fill={color} />
      <Circle cx={23} cy={12} r={1} fill={color} />
      <Circle cx={34} cy={23} r={1} fill={color} />
      <Circle cx={23} cy={34} r={1} fill={color} />
      <Circle cx={12} cy={23} r={1} fill={color} />
    </Svg>
  );
}

export function FlameSvg({ color, bg }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={22} fill={bg} />
      <Path
        d="M23 10c0 4.5 3 6.5 4.5 9 1.8 3 1.5 6.5-.5 9-2.5 3-6.5 3.5-9 1-2.5-2.5-2.5-6.5 0-9.5 2-2.5 2-4.5 2-7 .8 1.5 2.5 2.5 3 4.5.8-2 0-5 0-7z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M23 13c-1.2 3-3.8 5.2-3.8 8.8 0 3.3 2.5 6 5.8 6s5.8-2.7 5.8-6c0-3.5-3-5.5-3.8-8.8-.5 2-2 3.2-3 4-1-1.2-1-2.5-1-4z"
        fill={color}
      />
    </Svg>
  );
}
