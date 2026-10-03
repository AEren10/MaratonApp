import { Circle, Defs, G, Pattern, Path, Rect } from "react-native-svg";

export const HATCH_ID = "effortSlotHatch";
export const DOTS_ID = "effortSlotDots";

// Doku KIRMIZI DEGIL. Bos bir gunun accent ile ilgisi yok: accent "olan sey"
// demek. Cizgiler kenarlik tonunda, yalnizca yuzeye dokunus katiyor.
export function EffortSlotDefs({ color, dot }) {
  return (
    <Defs>
      {/* Bos gunun "dolacak yer" dokusu: cok silik kirmizi noktalar (kullanici). */}
      <Pattern id={DOTS_ID} patternUnits="userSpaceOnUse" width={6} height={6}>
        <Circle cx={3} cy={3} r={0.9} fill={dot || color} />
      </Pattern>
      <Pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width={6} height={6}>
        <Path
          d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      </Pattern>
    </Defs>
  );
}

/**
 * O gun doldurulabilecek alan.
 *
 * Eskiden accent'in %6-12 opakligiyla ciziliyordu; #1C1C23 zemininde bu
 * neredeyse gorunmuyor ve grafik "bos" hissettiriyordu. Simdi yuzey
 * merdiveninden GERCEK bir yuzey:
 *   gecmis/bugun -> track (yukseltilmis, dolacak bir yer)
 *   gelecek      -> void  (girintili, henuz siras gelmedi)
 * Kirmizi yalnizca icini dolduran cubukta kaliyor, boylece dolu ile bos
 * arasindaki fark da keskinlesiyor.
 */
export function EffortSlot({ x, y, width, height, radius, isToday, isFuture, C }) {
  if (height <= 0) return null;

  const fill = isFuture ? (C?.void || "#212129") : (C?.track || "#30303B");
  const stroke = isToday ? (C?.accent || "#E5343F") : (C?.line || "#34343F");

  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        strokeOpacity={isToday ? 0.6 : 0.4}
        strokeDasharray={isFuture ? "4 3" : undefined}
      />
      {/* Nokta dokusu: bugun silik, gelecek daha da silik. */}
      <Rect x={x} y={y} width={width} height={height} rx={radius}
        fill={`url(#${DOTS_ID})`} opacity={isToday ? 0.45 : 0.2} />
    </G>
  );
}
