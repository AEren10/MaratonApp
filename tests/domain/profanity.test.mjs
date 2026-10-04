import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { containsProfanity } from "../../src/domain/moderation/profanity.js";
import { SUBSTRING_WORDS, TOKEN_WORDS } from "../../src/domain/moderation/profanityWords.js";

test("acik kufurler yakalanir (yazim oyunlariyla)", () => {
  for (const t of ["amk", "AMK", "a.m.k", "Orospu çocuğu", "0r0spu", "siiiktir", "s1kt1r git", "o r o s p u", "f u c k", "Ahmet aq", "Piç"]) {
    assert.equal(containsProfanity(t), true, t);
  }
});

test("masum adlar ve kelimeler gecer", () => {
  for (const t of ["Ahmet Eren", "Sıkıntı yok", "Basık", "Sikke", "Gotik", "Kitap Kurdu", "Hamit", "Assist", "Cumhur", "Bokeh", "Scunthorpe", "Dicky"]) {
    assert.equal(containsProfanity(t), false, t);
  }
});

test("sunucu listesi (SQL) istemci listesiyle ayni", () => {
  const dir = new URL("../../supabase/migrations/", import.meta.url);
  const file = readdirSync(dir).filter((f) => f.includes("content_filter")).sort().pop();
  assert.ok(file, "content_filter migration yok");
  const sql = readFileSync(new URL(file, dir), "utf8");
  const grab = (tag) => {
    const m = sql.match(new RegExp(`-- ${tag}:([^\n]*)`));
    return m[1].trim().split(/\s+/).sort();
  };
  assert.deepEqual(grab("SUBSTRING_WORDS"), [...SUBSTRING_WORDS].sort());
  assert.deepEqual(grab("TOKEN_WORDS"), [...TOKEN_WORDS].sort());
});
