import { Fragment } from "react";
import { Rect } from "react-native-svg";

import { EffortBar } from "./EffortBar";
import { EffortSlot } from "./EffortSlot";

// Soru girilmemis ama calisilmis gun: sifir degil, kisa bir iz.
const MINUTES_ONLY_H = 6;

// Haftanin TEK gunu: doldurulabilecek kutu + icini dolduran cubuk.
export function EffortDay({
  day, index, todayIndex, goal, x, width, bottom, goalY, yOf, radius, C,
}) {
  const isToday = index === todayIndex;
  // Kutu HEDEF yuksekliginde: o gun doldurulabilecek alan bu kadar.
  // Hedefi asan gun kutunun disina tasar, kirpilmaz.
  const slotH = goalY != null ? bottom - goalY : 0;

  const slot = slotH > 0 ? (
    <EffortSlot
      x={x}
      y={goalY}
      width={width}
      height={slotH}
      radius={radius}
      isToday={isToday}
      isFuture={index > todayIndex}
      C={C}
    />
  ) : null;

  let barH = 0;
  let fill = C.track;
  if (day.questions > 0) {
    barH = Math.max(4, bottom - yOf(day.questions));
    // Hedefi tutturan gun vurgulanir; tutturamayan gun de gorunur kalir,
    // cezalandirilmaz.
    fill = goal > 0 && day.questions >= goal ? C.up : C.accent;
  } else if (day.minutesOnly) {
    barH = MINUTES_ONLY_H;
    fill = C.text5;
  }

  // Calisilmamis gun: yukselecek bir sey yok. Kutu zaten o gunun bos
  // kaldigini soyluyor; hedef yoksa ince bir taban izi kalir.
  if (barH <= 0) {
    if (slot) return slot;
    return (
      <Rect
        x={x} y={bottom - 2} width={width} height={2}
        rx={radius} fill={C.track} fillOpacity={0.5}
      />
    );
  }

  // Kutunun disina tasan gun: hedefi gecmis demektir.
  const overflow = slotH > 0 && barH > slotH + 2;

  return (
    <Fragment>
      {slot}
      {/* HEDEFI GECEN GUN: cubuk kutunun disina tasiyor ama bu fark
          edilmiyordu. Hedef cizgisinin hizasina zeminden ince bir centik
          koyuyoruz — cubuk cizgiyi gecerken gozle goruluyor, ayrica rozet
          gerekmiyor. */}
      {overflow ? (
        <Rect
          x={x} y={goalY - 1} width={width} height={2}
          fill={C.bg} fillOpacity={0.9}
        />
      ) : null}
      <EffortBar
        index={index}
        x={x}
        width={width}
        bottom={bottom}
        height={barH}
        radius={radius}
        fill={fill}
        fillOpacity={isToday ? 1 : 0.88}
      />
    </Fragment>
  );
}
