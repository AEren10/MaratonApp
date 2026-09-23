import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const actions = readFileSync(
  new URL("../../src/hooks/useShareCardActions.js", import.meta.url),
  "utf8",
);
const screen = readFileSync(
  new URL("../../src/screens/social/ShareCardScreen.js", import.meta.url),
  "utf8",
);
const storyShare = readFileSync(
  new URL("../../src/lib/storyShare.js", import.meta.url),
  "utf8",
);
const storyCard = readFileSync(
  new URL("../../src/screens/social/components/ShareStoryCard.js", import.meta.url),
  "utf8",
);

test("story share success records card metadata", () => {
  assert.match(actions, /import \{ EVENTS \} from "\.\.\/constants\/analytics"/);
  assert.match(actions, /track\(EVENTS\.WRAPPED_SHARED, \{ source: "share_card", \.\.\.\(getShareMeta\?\.\(\) \|\| \{\}\) \}\)/);
  assert.match(screen, /cardId: activeCard\?\.id \|\| null, mode/);
  assert.match(screen, /useShareCardActions\(cardRef, shareMeta\)/);
});

test("story share uses the native Instagram Stories social key", () => {
  assert.match(storyShare, /Share\.Social\?\.INSTAGRAM_STORIES \|\| INSTAGRAM_STORIES_FALLBACK/);
  assert.doesNotMatch(storyShare, /Share\.Social\.InstagramStories/);
});

test("share card preview keeps controls outside the captured story card", () => {
  assert.match(screen, /<ScrollView contentContainerStyle=\{s\.content\}/);
  assert.match(screen, /height: PREVIEW_SLOT_HEIGHT/);
  assert.match(screen, /cardWrap: \{ width: PREVIEW_CARD_WIDTH \}/);
  assert.match(storyCard, /size="large"/);
});

test("gallery save keeps write-only photo permission", () => {
  assert.match(storyShare, /MediaLibrary\.requestPermissionsAsync\(true\)/);
});
