import { test } from "node:test";
import assert from "node:assert/strict";

// ExamContext'teki cozum sirasi: BEKLEYEN yerel yazim > sunucu > yerel yedek.
// Kural saf bir karar oldugu icin burada aynen modelleniyor; regresyon
// olursa (sunucu bekleyen degeri yine ezerse) test kirilir.
function resolveNet(serverValue, local, pendingFlag, localKey) {
  return local[pendingFlag] && local[localKey] != null
    ? Number(local[localKey])
    : (serverValue == null ? local[localKey] ?? null : Number(serverValue));
}

const targetNet = (server, local) => resolveNet(server, local, "targetNetSyncPending", "targetNet");

test("bekleyen bayrak yoksa sunucu kazanir", () => {
  assert.equal(targetNet(72, { targetNet: 60 }), 72);
});

test("bekleyen yazim varsa YEREL kazanir -- sunucudaki deger eskidir", () => {
  // Kullanici 60'tan 75'e cekti, sunucu yazimi basarisiz oldu.
  // Eski hal 60 donduruyordu: kullanicinin degisikligi sessizce kayboluyordu.
  assert.equal(targetNet(60, { targetNet: 75, targetNetSyncPending: true }), 75);
});

test("sunucu bossa yerel yedek kullanilir", () => {
  assert.equal(targetNet(null, { targetNet: 68 }), 68);
});

test("ikisi de bossa null", () => {
  assert.equal(targetNet(null, {}), null);
});

test("bekleyen bayrak var ama yerel deger yoksa sunucu kazanir", () => {
  assert.equal(targetNet(72, { targetNetSyncPending: true }), 72);
});
