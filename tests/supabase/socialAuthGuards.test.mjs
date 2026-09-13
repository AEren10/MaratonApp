import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const friendsScreen = readFileSync(new URL("../../src/screens/social/FriendsScreen.js", import.meta.url), "utf8");
const quickPracticeScreen = readFileSync(new URL("../../src/screens/practice/QuickPracticeScreen.js", import.meta.url), "utf8");
const swipeReviewScreen = readFileSync(new URL("../../src/screens/wrong-notebook/SwipeReviewScreen.js", import.meta.url), "utf8");

test("friends removal callback tolerates an empty auth user during session transitions", () => {
  assert.match(friendsScreen, /const remove = useCallback\(async \(friendshipId\) => \{\s+if \(!user\?\.id\) return;/);
  assert.match(friendsScreen, /\}, \[load, user\?\.id\]\);/);
  assert.doesNotMatch(friendsScreen, /\}, \[load, user\.id\]\);/);
});

test("review practice callbacks tolerate an empty auth user during session transitions", () => {
  assert.match(quickPracticeScreen, /if \(feedback \|\| !user\?\.id\) return;\s+const q = questions\[idx\];\s+if \(!q\) return;/);
  assert.match(quickPracticeScreen, /\}, \[feedback, questions, idx, reward, user\?\.id\]\);/);
  assert.match(swipeReviewScreen, /if \(!current \|\| !user\?\.id\) return;/);
  assert.match(swipeReviewScreen, /\}, \[current, reward, user\?\.id\]\);/);
});
