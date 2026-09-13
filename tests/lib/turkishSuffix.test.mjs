import test from "node:test";
import assert from "node:assert/strict";

import { numberWithCase, withCase, numberLastWord } from "../../src/lib/turkishSuffix.js";

test("number suffix follows the spoken last word", () => {
  assert.equal(numberWithCase(71, "ablative"), "71'den");
  assert.equal(numberWithCase(73, "dative"), "73'e");
  assert.equal(numberWithCase(60, "ablative"), "60'tan");
  assert.equal(numberWithCase(66, "dative"), "66'ya");
  assert.equal(numberWithCase(40, "dative"), "40'a");
  assert.equal(numberWithCase(100, "ablative"), "100'den");
  assert.equal(numberWithCase(54, "ablative"), "54'ten");
  assert.equal(numberLastWord(90), "doksan");
});

test("word suffix uses vowel harmony and consonant hardening", () => {
  assert.equal(withCase("1 Temmuz", "locative"), "1 Temmuz'da");
  assert.equal(withCase("Haziran", "locative"), "Haziran'da");
  assert.equal(withCase("Eylül", "locative"), "Eylül'de");
  assert.equal(withCase("Mart", "locative"), "Mart'ta");
  assert.equal(withCase("Matematik", "locative"), "Matematik'te");
  assert.equal(withCase("Türkçe", "locative"), "Türkçe'de");
});
