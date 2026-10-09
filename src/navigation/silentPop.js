// "Sessiz geri": sekme yigininda ustteki ekranlari ANIMASYONSUZ kapatmak icin
// sekme basina kisa sureli bayrak. Sekmeye donunce icinde acik kalan alt
// ekran (Rota, Calisma gecmisi, Ayarlar...) gorunuyor, koke donus de saga
// kayan pop animasyonuyla oluyordu (sekme dondurulmus, animasyon donuste
// oynuyordu). Bayrak acikken o sekmenin TabStack ekranlari animation: "none"
// ile cizilir; pop eden taraf once bayragi acar, yigin yeniden cizilir.
const armed = new Set();
const listeners = new Set();

function emit() { listeners.forEach((fn) => fn()); }

export const silentPop = {
  get: (key) => armed.has(key),
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  arm(key) { if (!armed.has(key)) { armed.add(key); emit(); } },
  disarm(key) { if (armed.delete(key)) emit(); },
};

// Bayrak acikken ekran seceneklerine animasyonsuz gecis eklenir.
export function withSilent(options, isSilent) {
  return isSilent ? { ...(options || {}), animation: "none" } : options;
}
