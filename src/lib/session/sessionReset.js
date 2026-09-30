// KULLANICIYA BAGLI MODUL ONBELLEKLERI
//
// Modul seviyesinde tutulan durum (paylasilan toast/modal, bekleyen kayit
// zamanlayicisi, widget son-yazim onbellegi...) React agacindan bagimsiz
// yasiyor: RESET_STORE onlara dokunmuyor. Cikis->baska hesapla giris ya da
// oturumun kendiliginden dusmesi sonrasi A'nin durumu B'ye tasiniyordu.
// Boyle bir modul burada kayit olur; oturum sifirlaninca hepsi temizlenir.

const resets = new Set();

export function registerSessionReset(fn) {
  if (typeof fn !== "function") return () => {};
  resets.add(fn);
  return () => { resets.delete(fn); };
}

// Biri patlarsa digerleri yine calisir. Donen deger basarisiz sayisi.
export function runSessionResets() {
  let failed = 0;
  resets.forEach((fn) => {
    try { fn(); } catch (_) { failed += 1; }
  });
  return failed;
}

// Onceki kullanici vardi ve artik yok ya da baskasi: yerel durum sifirlanmali.
// null -> A (ilk giris / acilis) sifirlama degil.
export function isUserSwitch(prevUserId, nextUserId) {
  return !!prevUserId && prevUserId !== (nextUserId ?? null);
}
