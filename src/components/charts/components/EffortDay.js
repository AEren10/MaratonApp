import { Fragment } from "react";
import { Rect } from "react-native-svg";

import { EffortBar } from "./EffortBar";
import { EffortSlot } from "./EffortSlot";

// Haftanin TEK gunu: doldurulabilecek kutu + icini dolduran cubuk.
export function EffortDay({
  day, index, todayIndex, goal, x, width, bottom, goalY, yOf, radius, C, replay,
}) {
  const isToday = index === todayIndex;
  // Kutu HEDEF yuksekliginde: o gun doldurulabilecek alan bu kadar.
  // Yalniz BUGUN ve ileriki gunlerde: gun bittiyse taslak kapanir, geriye
  // yalniz dolan cubuk kalir (kullanici karari, 29 Eylul). Gecmis gunun bos
  // kutusu ustteki sure etiketiyle de cakisiyordu.
  const open = todayIndex == null || index >= todayIndex;
  const slotH = open && goalY != null ? bottom - goalY : 0;

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

  // Cubuk SURE (dakika): soru girilmemis calisma da dolar.
  let barH = 0;
  let fill = C.track;
  if (day.minutes > 0) {
    barH = Math.max(4, bottom - yOf(day.minutes));
    // TEK TON, TAM RENK (9 Ekim, kullanici): calisilan her gun -- gecmis de
    // bugun de, hedefe ulasmasa da -- ana renkte. Eskiden hedefi tutmayan
    // gun yari saydamdi ve "soluk" okunuyordu.
    fill = C.accent;
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
  // Gecmis gun kapali: tam opak, bugunun cubugu gibi.

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
        replay={replay}
        index={index}
        x={x}
        width={width}
        bottom={bottom}
        height={barH}
        radius={radius}
        fill={fill}
        fillOpacity={1}
      />
    </Fragment>
  );
}
