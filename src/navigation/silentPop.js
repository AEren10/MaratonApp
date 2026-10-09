// "Sessiz geri": sekme yigininda ustteki ekranlari ANIMASYONSUZ kapatmak icin
// kisa sureli bayrak. Ana Sayfa sekmesine basinca icinde acik kalan Rota vb.
// koke donerken saga kayiyordu (sekme dondurulmus, pop animasyonu donuste
// oynuyordu). Bayrak acikken TabStack ekranlari animation: "none" ile cizilir;
// pop'u yapan taraf once bayragi acar, yigin yeniden cizilir, sonra pop eder.
let silent = false;
const listeners = new Set();

function emit() { listeners.forEach((fn) => fn()); }

export const silentPop = {
  get: () => silent,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  arm() { if (!silent) { silent = true; emit(); } },
  disarm() { if (silent) { silent = false; emit(); } },
};

// Bayrak acikken ekran seceneklerine animasyonsuz gecis eklenir.
export function withSilent(options, isSilent) {
  return isSilent ? { ...(options || {}), animation: "none" } : options;
}
