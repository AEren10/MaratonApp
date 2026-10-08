import test from "node:test";
import assert from "node:assert/strict";

import {
  cleanPublisherName,
  normalizePublisherSelection,
  publisherLabel,
  visiblePublisherOptions,
} from "../../../src/domain/trial/publisherSelection.js";

const publishers = [
  { id: "pub-1", key: "apotemi", name: "Apotemi" },
  { id: "pub-other", key: "other", name: "Diğer" },
];

test("Diğer katalog seçeneğini gizler", () => {
  assert.deepEqual(visiblePublisherOptions(publishers), [publishers[0]]);
});

test("serbest yayın adını kırpar ve uzunluğu sınırlar", () => {
  assert.equal(cleanPublisherName("  Üç Dört Beş  "), "Üç Dört Beş");
  assert.equal(cleanPublisherName("Üç\nDört\u0000Beş"), "ÜçDörtBeş");
  assert.equal(cleanPublisherName("x".repeat(80)).length, 60);
});

test("serbest yayın adı katalog seçimiyle aynı anda kalamaz", () => {
  assert.deepEqual(
    normalizePublisherSelection({ publisherId: "pub-1", publisherName: "  3D  " }),
    { publisherId: null, publisherName: "3D" },
  );
  assert.deepEqual(
    normalizePublisherSelection({ publisherId: "pub-1", publisherName: "   " }),
    { publisherId: "pub-1", publisherName: "" },
  );
});

test("serbest yayın adı seçili katalog yayınından önceliklidir", () => {
  assert.equal(publisherLabel({ publishers, publisherId: "pub-1", publisherName: "  3D  " }), "3D");
  assert.equal(publisherLabel({ publishers, publisherId: "pub-1", publisherName: "" }), "Apotemi");
});
