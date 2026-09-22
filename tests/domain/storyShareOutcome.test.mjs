import test from "node:test";
import assert from "node:assert/strict";

import { storyShareOutcome, STORY_SHARE } from "../../src/domain/share/storyShareOutcome.js";

test("pano hazir ve Instagram acildiysa paylasim acilmis sayilir", () => {
  assert.equal(storyShareOutcome({ copied: true, opened: true }), STORY_SHARE.OPENED);
});

test("Instagram acilamadiysa etiket yine de panoda — bu bir hata degil", () => {
  assert.equal(storyShareOutcome({ copied: true, opened: false }), STORY_SHARE.COPIED);
});

test("panoya konamadiysa paylasilacak bir sey yok", () => {
  assert.equal(storyShareOutcome({ copied: false, opened: false }), STORY_SHARE.FAILED);
  assert.equal(storyShareOutcome({ copied: false, opened: true }), STORY_SHARE.FAILED);
});

test("etiket dogrudan yerlestiyse en iyi hal — pano hic devreye girmez", () => {
  assert.equal(storyShareOutcome({ placed: true }), STORY_SHARE.PLACED);
  assert.equal(storyShareOutcome({ placed: true, copied: false }), STORY_SHARE.PLACED);
});

test("yerlesmediyse eski pano yolu aynen gecerli", () => {
  assert.equal(storyShareOutcome({ placed: false, copied: true, opened: true }), STORY_SHARE.OPENED);
  assert.equal(storyShareOutcome({ placed: false, copied: true, opened: false }), STORY_SHARE.COPIED);
  assert.equal(storyShareOutcome({ placed: false, copied: false }), STORY_SHARE.FAILED);
});
