// Şifre sıfırlama linki tanıma — saf URL ayrıştırma, Supabase istemcisine
// bağlı değil (bu sayede test edilebilir).
//
// Yanlış POZİTİF pahalıdır: normal bir link kurtarma sanılırsa uygulama
// şifre belirleme ekranında kilitlenir. Yanlış NEGATİF de pahalıdır:
// sıfırlama akışı ekranı oturum açılınca kaybeder.

export function isRecoveryUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const qIndex = url.indexOf("?");
    const hIndex = url.indexOf("#");
    const query = qIndex >= 0 ? new URLSearchParams(url.slice(qIndex + 1).split("#")[0]) : null;
    const hash = hIndex >= 0 ? new URLSearchParams(url.slice(hIndex + 1)) : null;

    if ((query?.get("type") || hash?.get("type")) === "recovery") return true;

    // Yol tabanlı kontrol: sorgu/parça kısmı olmadan da tanınmalı.
    const pathPart = url.split("?")[0].split("#")[0];
    return pathPart.includes("sifre-belirle");
  } catch (_) {
    return false;
  }
}
