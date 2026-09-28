import test from "node:test";
import assert from "node:assert/strict";

import { formatGroupJoinError } from "../../src/screens/league/groupErrors.js";

test("formatGroupJoinError preserves throttle lockout message as is", () => {
  const err = new Error("Çok fazla başarısız deneme. 284 saniye sonra tekrar deneyin.");
  const res = formatGroupJoinError(err, "ABC123", []);
  assert.equal(res, "Çok fazla başarısız deneme. 284 saniye sonra tekrar deneyin.");
});

test("formatGroupJoinError preserves wait backoff message as is", () => {
  const err = new Error("Lütfen 8 saniye bekleyin.");
  const res = formatGroupJoinError(err, "ABC123", []);
  assert.equal(res, "Lütfen 8 saniye bekleyin.");
});

test("formatGroupJoinError identifies already member via groups array", () => {
  const groups = [{ code: "GRP101", name: "Ders Çalışma" }];
  const res = formatGroupJoinError(new Error("Fail"), "GRP101", groups);
  assert.equal(res, "Bu gruba zaten üyesin.");
});

test("formatGroupJoinError identifies already member via error message", () => {
  const res = formatGroupJoinError(new Error("Bu gruba zaten üyesiniz"), "XYZ999", []);
  assert.equal(res, "Bu gruba zaten üyesin.");
});

test("formatGroupJoinError warns for invalid short code", () => {
  const res = formatGroupJoinError(new Error("Grup kodu 6 hane olmalı"), "AB1", []);
  assert.equal(res, "Lütfen 6 haneli kodu eksiksiz gir.");
});

test("formatGroupJoinError identifies not found / invalid code", () => {
  const err = new Error("Grup bulunamadı");
  err.reason = "not_found";
  const res = formatGroupJoinError(err, "NOTFND", []);
  assert.equal(res, "Grup kodu geçersiz veya grup bulunamadı.");
});
