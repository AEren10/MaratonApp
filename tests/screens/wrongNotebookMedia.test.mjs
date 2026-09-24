import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const topicRow = readFileSync(
  new URL("../../src/screens/wrong-notebook/components/WrongTopicRow.js", import.meta.url),
  "utf8",
);
const thumb = readFileSync(
  new URL("../../src/screens/wrong-notebook/components/WrongThumb.js", import.meta.url),
  "utf8",
);
const detail = readFileSync(
  new URL("../../src/screens/wrong-notebook/components/detail/OwnWrongDetail.js", import.meta.url),
  "utf8",
);

test("wrong notebook topic rows show the saved question image instead of only a placeholder", () => {
  assert.match(topicRow, /lead\.image_path \|\| lead\.image_uri \|\| lead\.image_local_uri/);
  assert.match(topicRow, /<WrongThumb[^>]*imagePath=\{imagePath\}/);
  assert.match(thumb, /<SignedImage/);
  assert.match(thumb, /contentFit="cover"/);
});

test("wrong notebook topic rows keep the user's note visible in the list", () => {
  assert.match(topicRow, /lead\.note \? \(/);
  assert.match(topicRow, /\{lead\.note\}/);
});

test("own wrong detail renders persisted image path, topic and note editor props", () => {
  assert.match(detail, /item\.image_path \|\| item\.image_uri \|\| item\.image_local_uri/);
  assert.match(detail, /<DetailPhoto path=\{imagePath\}/);
  assert.match(detail, /item\.topic_title \|\| item\.topic/);
  assert.match(detail, /<WhyWrongCard note=\{item\.note\} onSave=\{d\.saveNote\}/);
});
