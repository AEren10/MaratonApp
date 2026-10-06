import * as appStorage from "./storage/appStorage";
import { registerSessionReset } from "./session/sessionReset";

// Kayit oncesi rota onizlemesinin cevaplari (sinav, alan, yil, gunluk soru).
// Kayittan sonra kurulum bunlarla baslar: sinav ekrani atlanir, hedef ekrani
// gunluk sureyi hazir getirir. Bellekte de tutulur: kayit ayni oturumda
// biterse yigin acilirken (senkron) okunabilsin.
const KEY = "@maraton:pending_route_preview";
let memory = null;

export function setPendingPreview(answers) {
  memory = answers || null;
  if (answers) appStorage.setJson(KEY, answers).catch(() => {});
  else appStorage.remove(KEY).catch(() => {});
}

export function peekPendingPreview() {
  return memory;
}

export async function loadPendingPreview() {
  if (memory) return memory;
  memory = await appStorage.getJson(KEY, null).catch(() => null);
  return memory;
}

export async function clearPendingPreview() {
  memory = null;
  await appStorage.remove(KEY).catch(() => {});
}

// SIGNED_OUT ve hesap degisimi logout butonu disindan da olabilir. Modul
// bellegi aninda sifirlanir; kalici taslak arka planda temizlenir.
registerSessionReset(() => {
  memory = null;
  appStorage.remove(KEY).catch(() => {});
});

// Kayit ekraninin alt cumlesi. "Rotan hazir" yalniz onizlemeden gelindiyse
// dogru; Giris'ten gelen kullanicinin rotasi henuz cizilmedi.
export function registerLeadCopy() {
  return memory
    ? "Rotan hazır. Hesap onu buluta alır — hangi telefondan girersen aynı yerden devam eder."
    : "Sonra üç kısa soru ve rotan çizilir. Hesabın onu buluta bağlar; hangi telefondan girersen aynı duraktan devam edersin.";
}
