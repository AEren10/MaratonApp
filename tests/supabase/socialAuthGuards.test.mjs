import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const friendsScreen = readFileSync(new URL("../../src/screens/social/FriendsScreen.js", import.meta.url), "utf8");

test("friends removal callback tolerates an empty auth user during session transitions", () => {
  assert.match(friendsScreen, /const remove = useCallback\(async \(friendshipId\) => \{\s+if \(!user\?\.id\) return;/);
  assert.match(friendsScreen, /\}, \[load, user\?\.id\]\);/);
  assert.doesNotMatch(friendsScreen, /\}, \[load, user\.id\]\);/);
});
