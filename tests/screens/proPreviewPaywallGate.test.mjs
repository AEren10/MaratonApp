import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/screens/premium/ProPreviewScreen.js", import.meta.url),
  "utf8",
);
const variants = readFileSync(
  new URL("../../src/constants/proPreviewVariants.js", import.meta.url),
  "utf8",
);
const ocr = readFileSync(
  new URL("../../src/screens/premium/components/ProPreviewOcr.js", import.meta.url),
  "utf8",
);

test("pro preview CTA uses the central premium paywall gate", () => {
  assert.match(source, /import \{ usePremium \} from "\.\.\/\.\.\/contexts\/PremiumContext";/);
  assert.match(source, /const \{ showPaywall \} = usePremium\(\);/);
  assert.match(source, /showPaywall\(source \|\| "pro_preview"\)/);
  assert.doesNotMatch(source, /SCREENS\.PAYWALL/);
  assert.doesNotMatch(source, /navigation\.replace\(SCREENS\.PAYWALL/);
});

test("pro preview supports OCR detail without inventing a live OCR route", () => {
  assert.match(variants, /ocr: "ocr"/);
  assert.match(source, /detail === "ocr"/);
  assert.match(ocr, /selectLatestTrial/);
  assert.match(ocr, /latest\?\.subjects/);
  assert.doesNotMatch(ocr, /SCREENS\.|navigation\.navigate/);
});
