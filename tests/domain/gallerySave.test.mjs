import assert from "node:assert/strict";
import test from "node:test";

import { saveCapturedStoryToGallery } from "../../src/domain/share/gallerySave.js";
import { STORY_SHARE } from "../../src/domain/share/storyShareOutcome.js";

function saveWith({ platform, platformVersion, granted, createAsset }) {
  return saveCapturedStoryToGallery({
    uri: "file:///story.png",
    platform,
    platformVersion,
    requestWritePermission: async () => ({ granted }),
    createAsset,
  });
}

test("Android 11+ writes with scoped storage even when permission response is denied", async () => {
  let created = false;
  const outcome = await saveWith({
    platform: "android",
    platformVersion: 30,
    granted: false,
    createAsset: async () => { created = true; },
  });

  assert.equal(created, true);
  assert.equal(outcome, STORY_SHARE.SAVED);
});

test("Android 11+ reports a real write failure instead of a permission error", async () => {
  const outcome = await saveWith({
    platform: "android",
    platformVersion: 35,
    granted: false,
    createAsset: async () => { throw new Error("disk full"); },
  });

  assert.equal(outcome, STORY_SHARE.FAILED);
});

test("Android 10 and iOS do not write after their required permission is denied", async () => {
  for (const [platform, platformVersion] of [["android", 29], ["ios", "18.0"]]) {
    let created = false;
    const outcome = await saveWith({
      platform,
      platformVersion,
      granted: false,
      createAsset: async () => { created = true; },
    });

    assert.equal(created, false);
    assert.equal(outcome, STORY_SHARE.PERMISSION_DENIED);
  }
});

test("granted write permission creates the asset on every platform", async () => {
  let created = false;
  const outcome = await saveWith({
    platform: "ios",
    platformVersion: "18.0",
    granted: true,
    createAsset: async () => { created = true; },
  });

  assert.equal(created, true);
  assert.equal(outcome, STORY_SHARE.SAVED);
});

test("permission request failures are reported as save failures", async () => {
  let created = false;
  const outcome = await saveCapturedStoryToGallery({
    uri: "file:///story.png",
    platform: "android",
    platformVersion: 35,
    requestWritePermission: async () => { throw new Error("native unavailable"); },
    createAsset: async () => { created = true; },
  });

  assert.equal(created, false);
  assert.equal(outcome, STORY_SHARE.FAILED);
});
