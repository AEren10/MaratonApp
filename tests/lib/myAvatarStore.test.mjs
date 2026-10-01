import test from "node:test";
import assert from "node:assert/strict";

import { getMyAvatar, isMyAvatarLoaded, setMyAvatar, subscribeMyAvatar } from "../../src/lib/myAvatarStore.js";

test("yukleme tum dinleyicilere gider, kullanici degisince gecersiz", () => {
  let calls = 0;
  const off = subscribeMyAvatar(() => { calls += 1; });
  setMyAvatar("u1", "https://x/a.jpg?t=1");
  assert.equal(calls, 1);
  assert.equal(getMyAvatar().url, "https://x/a.jpg?t=1");
  assert.ok(isMyAvatarLoaded("u1"));
  assert.ok(!isMyAvatarLoaded("u2"));
  setMyAvatar("u1", null);
  assert.equal(getMyAvatar().url, null);
  off();
  setMyAvatar("u1", "y");
  assert.equal(calls, 2);
});
