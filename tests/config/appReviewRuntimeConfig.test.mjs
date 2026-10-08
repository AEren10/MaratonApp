import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appJson = JSON.parse(readFileSync(new URL("../../app.json", import.meta.url), "utf8"));
const expo = appJson.expo;

function pluginName(plugin) {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}

function pluginOptions(plugin) {
  return Array.isArray(plugin) ? plugin[1] : undefined;
}

test("review build uses the live domain and final mobile identifiers", () => {
  assert.equal(expo.ios.bundleIdentifier, "com.ahmeterensiranli.maraton");
  assert.equal(expo.android.package, "com.ahmeterensiranli.maraton");
  assert.deepEqual(expo.ios.associatedDomains, ["applinks:maratonapp.com"]);
  assert.deepEqual(
    expo.android.intentFilters[0].data.map((entry) => entry.host),
    ["maratonapp.com", "maratonapp.com", "maratonapp.com"],
  );
});

test("Expo plugins avoid duplicate native review surfaces", () => {
  const names = expo.plugins.map(pluginName);
  assert.equal(names.filter((name) => name === "expo-widgets").length, 1);
  assert.equal(names.filter((name) => name === "@sentry/react-native/expo").length, 1);
  assert.equal(names.includes("@sentry/react-native"), false);

  const secureStore = expo.plugins.find((plugin) => pluginName(plugin) === "expo-secure-store");
  assert.equal(pluginOptions(secureStore).faceIDPermission, false);

  const widgets = expo.plugins.find((plugin) => pluginName(plugin) === "expo-widgets");
  assert.equal(pluginOptions(widgets).bundleIdentifier, "com.ahmeterensiranli.maraton.ExpoWidgetsTarget");
  assert.equal(pluginOptions(widgets).groupIdentifier, "group.com.ahmeterensiranli.maraton");
});

test("Android manifest blocks broad photo-library read permissions", () => {
  assert.ok(expo.android.blockedPermissions.includes("android.permission.READ_MEDIA_IMAGES"));
  assert.ok(expo.android.blockedPermissions.includes("android.permission.READ_MEDIA_VISUAL_USER_SELECTED"));
});

test("runtime app copy and links no longer point at the unused maraton.app domain", () => {
  const files = [
    "../../.env.example",
    "../../src/navigation/linking.js",
    "../../src/constants/legalDocs.js",
    "../../src/screens/settings/AboutScreen.js",
    "../../src/screens/settings/SettingsScreen.js",
    "../../src/screens/settings/useSettingsActions.js",
    "../../src/hooks/useReferrals.js",
    "../../src/screens/trial/components/TrialReportCard.js",
    "../../src/screens/trial/components/TrialShareCard.js",
    "../../web/privacy.html",
    "../../web/terms.html",
    "../../web/delete-account.html",
  ];

  for (const file of files) {
    const body = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(body, /maraton\.app/);
  }
});
