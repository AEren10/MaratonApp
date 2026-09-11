import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/storage.js", import.meta.url), "utf8");

test("avatar cleanup happens after successful upload", () => {
  const uploadAvatar = source.slice(
    source.indexOf("export const uploadAvatar"),
    source.indexOf("export const getAvatarUrl"),
  );

  const uploadIndex = uploadAvatar.indexOf(".upload(path, buffer");
  const throwIndex = uploadAvatar.indexOf("if (error) throw error");
  const removeIndex = uploadAvatar.indexOf(".remove(stale)");

  assert.ok(uploadIndex > -1, "upload call should exist");
  assert.ok(throwIndex > uploadIndex, "upload errors should be checked");
  assert.ok(removeIndex > throwIndex, "stale avatar cleanup should happen only after successful upload");
});
