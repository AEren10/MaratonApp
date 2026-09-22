import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const avatarHookSource = readFileSync(new URL("../../src/hooks/useAvatarUpload.js", import.meta.url), "utf8");
const addWrongHookSource = readFileSync(new URL("../../src/hooks/useAddWrong.js", import.meta.url), "utf8");
const photoCaptureSource = readFileSync(new URL("../../src/screens/wrong-notebook/components/add/PhotoCapture.js", import.meta.url), "utf8");

test("useAvatarUpload stamps URL with timestamp in updateProfile to bust expo-image disk cache", () => {
  assert.match(avatarHookSource, /stampedUrl = url \? `\${url}\?t=\${Date\.now\(\)}` : url;/);
  assert.match(avatarHookSource, /updateProfile\(user\.id, \{ avatar_url: stampedUrl \}\)/);
  assert.match(avatarHookSource, /setAvatarUri\(stampedUrl\)/);
});

test("useAvatarUpload supports removeAvatar to clear profile photo", () => {
  assert.match(avatarHookSource, /removeAvatar = useCallback\(async \(\) =>/);
  assert.match(avatarHookSource, /updateProfile\(user\.id, \{ avatar_url: null \}\)/);
  assert.match(avatarHookSource, /Fotoğrafı Kaldır/);
});

test("useAvatarUpload re-syncs on screen focus", () => {
  assert.match(avatarHookSource, /useIsFocused/);
  assert.match(avatarHookSource, /if \(!isFocused \|\| !user\?\.id/);
});

test("useAddWrong supports both camera and gallery picking", () => {
  assert.match(addWrongHookSource, /requestCameraPermissionsAsync/);
  assert.match(addWrongHookSource, /requestMediaLibraryPermissionsAsync/);
  assert.match(addWrongHookSource, /launchCameraAsync/);
  assert.match(addWrongHookSource, /launchImageLibraryAsync/);
  assert.match(addWrongHookSource, /clearImage/);
});

test("PhotoCapture provides camera, gallery, and remove buttons", () => {
  assert.match(photoCaptureSource, /onCamera/);
  assert.match(photoCaptureSource, /onGallery/);
  assert.match(photoCaptureSource, /onRemove/);
  assert.match(photoCaptureSource, /Fotoğraf çek/);
  assert.match(photoCaptureSource, /Galeriden seç/);
  assert.match(photoCaptureSource, /Fotoğrafı kaldır/);
});
