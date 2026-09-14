// "DENEME BITTI" KARARI — saf.
//
// Sunucu anlik goruntusu ilk haftanin BITIS tarihini vermiyor; yalniz
// o anki modu veriyor (accessMode: premium | onboarding_grace | free).
// Bu yuzden bitis bir GECIS olarak yakalanir: ilk haftada goruldu
// (isFirstWeek) ve simdi ucretsiz -> bir kez goster.
//
// Ilk haftayi Pro'da gecirmis kullanici icin "7 gun doldu" yanlis olur;
// Pro gorulunce kayit kapanir.
//
// @param state { sawGrace?: boolean, shown?: boolean } yerel kayit
// @returns { show: boolean, next: state | null }  next null ise yazma yok
export function accessEndedDecision({ snapshot, state } = {}) {
  const current = state || {};
  if (!snapshot || current.shown) return { show: false, next: null };

  if (snapshot.accessMode === "premium" || snapshot.isPremium === true) {
    return { show: false, next: { ...current, shown: true } };
  }
  if (snapshot.isFirstWeek === true) {
    return current.sawGrace
      ? { show: false, next: null }
      : { show: false, next: { ...current, sawGrace: true } };
  }
  if (snapshot.accessMode === "free" && current.sawGrace) {
    return { show: true, next: { ...current, shown: true } };
  }
  return { show: false, next: null };
}
