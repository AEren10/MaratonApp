// Ilk gun kahraman sayisi — SAF.
//
// Once ekranin en buyuk tipografisi (96px Bricolage) "0"a harcaniyordu:
// uygulamanin en yuksek sesi, kullanici hakkinda en anlamsiz seyi soyluyordu.
// Ustelik hayalet renkte, yani hem devasa hem okunmaz.
//
// Sira onem sirasidir. Hicbir adimda sayi UYDURULMAZ; her basamak ya
// kullanicinin kendi beyanindan ya da rotanin kendisinden gelir.
export const HERO_KIND = {
  GAP: "gap",        // hedef - baslangic: uygulamanin isini tek sayida anlatir
  TARGET: "target",  // yalniz hedef biliniyor
  STOPS: "stops",    // ikisi de yok: rotanin buyuklugu gercek ve etkileyici
  DAYS: "days",      // rota da yoksa geri kalan tek gercek
};

export function firstDayHero({ declared, stopCount, daysUntilExam } = {}) {
  const num = (label) => {
    const m = /(-?\d+(?:[.,]\d+)?)/.exec(String(label ?? ""));
    return m ? Number(m[1].replace(",", ".")) : null;
  };

  const start = num(declared?.startLabel);
  const goal = num(declared?.goalLabel);

  // Hedef baslangictan dusukse "kapatman gereken" demek anlamsiz olur.
  if (start != null && goal != null && goal > start) {
    return {
      kind: HERO_KIND.GAP,
      value: Math.round(goal - start),
      unit: "net",
      label: "Kapatman gereken",
      // Hedef zaten biliniyor -> davet yok.
      invite: null,
    };
  }

  if (goal != null) {
    return { kind: HERO_KIND.TARGET, value: Math.round(goal), unit: "net", label: "Hedefin", invite: null };
  }

  // Hedef yoksa ekran susmaz, ISTER. Bu ayni zamanda gun 1 icin anlamli bir
  // eylem: 30 saniyede yapilir ve ertesi gun butun ekranlari doldurur.
  const invite = "Hedefini belirle";

  if (Number.isFinite(stopCount) && stopCount > 0) {
    return { kind: HERO_KIND.STOPS, value: Math.round(stopCount), unit: "durak", label: "Rotanda", invite };
  }

  if (Number.isFinite(daysUntilExam) && daysUntilExam > 0) {
    return { kind: HERO_KIND.DAYS, value: Math.round(daysUntilExam), unit: "gün", label: "Sınava", invite };
  }

  return null;
}
