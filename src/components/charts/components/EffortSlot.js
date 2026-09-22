import { Defs, Pattern, Path, Rect } from "react-native-svg";

// GUNUN YERI: o gun doldurulabilecek alanin kendisi.
//
// NEDEN VAR
// Cubuk tek basina yalnizca YAPILANI gosteriyordu; yapilmayan gun bos bir
// bosluktu ve hedefin nerede oldugu sadece ustteki kesikli cizgiden
// okunuyordu. Her gunun kendi kutusu cizilince hedef her cubugun yaninda
// duruyor: kutu dolduysa gun tamam, yarisi kaldiysa yarisi kaldi.
//
// GELECEK GUN CEZALANDIRILMAZ
// Yasanmis gunun kutusu tarali ve kenari duz: "burasi vardi". Gelecek gunun
// kenari kesikli ve taramasiz: henuz gelmedi, bos kalmasi bir eksik degil.
export const HATCH_ID = "effortSlotHatch";

export function EffortSlotDefs({ color }) {
  return (
    <Defs>
      {/* 45 derece kesintisiz tarama. patternTransform kullanilmiyor:
          desenin kendisi kose kose cizilerek tekrarda ek yeri birakmiyor. */}
      <Pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width={5} height={5}>
        <Path
          d="M-1,1 l2,-2 M0,5 l5,-5 M4,6 l2,-2"
          stroke={color}
          strokeWidth={1}
        />
      </Pattern>
    </Defs>
  );
}

export function EffortSlot({ x, y, width, height, radius, isFuture, edge }) {
  if (height <= 0) return null;
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={radius}
      fill={isFuture ? "none" : `url(#${HATCH_ID})`}
      fillOpacity={0.5}
      stroke={edge}
      strokeWidth={1}
      strokeOpacity={isFuture ? 0.55 : 0.9}
      strokeDasharray={isFuture ? "3 4" : undefined}
    />
  );
}
