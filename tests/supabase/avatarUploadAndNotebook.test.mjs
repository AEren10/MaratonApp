import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const avatarHookSource = readFileSync(new URL("../../src/hooks/useAvatarUpload.js", import.meta.url), "utf8");
const addWrongHookSource = readFileSync(new URL("../../src/hooks/useAddWrong.js", import.meta.url), "utf8");
const photoCaptureSource = readFileSync(new URL("../../src/screens/wrong-notebook/components/add/PhotoCapture.js", import.meta.url), "utf8");

test("useAvatarUpload stamps URL with timestamp in updateProfile to bust expo-image disk cache", () => {
  assert.match(avatarHookSource, /stampedUrl = url \? `\${url}\?t=\${Date\.now\(\)}` : url;/);
  assert.match(avatarHookSource, /updateProfile\(user\.id, \{ avatar_url: stampedUrl \}\)/);
  assert.match(avatarHookSource, /setMyAvatar\(user\.id, stampedUrl\)/);
});

test("useAvatarUpload supports removeAvatar to clear profile photo", () => {
  assert.match(avatarHookSource, /removeAvatar = useCallback\(async \(\) =>/);
  assert.match(avatarHookSource, /updateProfile\(user\.id, \{ avatar_url: null \}\)/);
  assert.match(avatarHookSource, /Fotoğrafı Kaldır/);
});

test("profil fotografi tek kaynaktan: ayarlar ve ana sayfa ayni degeri okur", () => {
  const settings = readFileSync(new URL("../../src/screens/settings/components/SettingsIdentityCard.js", import.meta.url), "utf8");
  const topBar = readFileSync(new URL("../../src/screens/home/components/HomeTopBar.js", import.meta.url), "utf8");
  assert.match(avatarHookSource, /useMyAvatar\(\)/);
  assert.match(settings, /useMyAvatar\(\)/);
  assert.match(topBar, /useMyAvatar\(\)/);
  assert.doesNotMatch(settings, /user_metadata/);
});

test("useAddWrong supports both camera and gallery picking", () => {
  assert.match(addWrongHookSource, /requestCameraPermissionsAsync/);
  assert.match(addWrongHookSource, /Platform\.OS === "ios"[\s\S]*requestMediaLibraryPermissionsAsync/);
  assert.match(addWrongHookSource, /launchCameraAsync/);
  assert.match(addWrongHookSource, /launchImageLibraryAsync/);
  assert.match(addWrongHookSource, /clearImage/);
});

test("Android gallery pickers rely on the system photo picker without read permission", () => {
  assert.match(avatarHookSource, /Platform\.OS === "ios"[\s\S]*requestMediaLibraryPermissionsAsync/);
  assert.match(avatarHookSource, /launchImageLibraryAsync/);
  assert.match(addWrongHookSource, /Platform\.OS === "ios"[\s\S]*requestMediaLibraryPermissionsAsync/);
  assert.match(addWrongHookSource, /launchImageLibraryAsync/);
});

test("PhotoCapture provides camera, gallery, and remove buttons", () => {
  assert.match(photoCaptureSource, /onCamera/);
  assert.match(photoCaptureSource, /onGallery/);
  assert.match(photoCaptureSource, /onRemove/);
  assert.match(photoCaptureSource, /Fotoğraf çek/);
  assert.match(photoCaptureSource, /Galeriden seç/);
  assert.match(photoCaptureSource, /Fotoğrafı kaldır/);
});
