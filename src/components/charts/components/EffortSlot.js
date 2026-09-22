import { Defs, G, Pattern, Path, Rect } from "react-native-svg";

export const HATCH_ID = "effortSlotHatch";

export function EffortSlotDefs({ color }) {
  return (
    <Defs>
      <Pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width={6} height={6}>
        <Path
          d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.16}
        />
      </Pattern>
    </Defs>
  );
}

export function EffortSlot({ x, y, width, height, radius, isToday, isFuture, C }) {
  if (height <= 0) return null;
  const accent = C?.accent || "#E5343F";
  const bgOpacity = isToday ? 0.12 : isFuture ? 0.06 : 0.08;
  const strokeOpacity = isToday ? 0.38 : isFuture ? 0.18 : 0.22;

  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={accent}
        fillOpacity={bgOpacity}
      />
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={`url(#${HATCH_ID})`}
        stroke={accent}
        strokeWidth={1}
        strokeOpacity={strokeOpacity}
        strokeDasharray={isFuture ? "4 3" : undefined}
      />
    </G>
  );
}

