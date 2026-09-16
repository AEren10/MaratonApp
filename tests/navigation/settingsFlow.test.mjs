import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("settings hub keeps the screenshot route rows wired", () => {
  const settings = src("src/screens/settings/SettingsScreen.js");

  for (const route of [
    "EDIT_PROFILE",
    "GOALS",
    "EXAM_DATE",
    "CLASS_SCHEDULE",
    "NOTIFICATIONS_SETTINGS",
    "APPEARANCE",
    "PRIVACY",
    "TERMS",
    "ABOUT",
    "EDIT_EMAIL",
    "CHANGE_PASSWORD",
  ]) {
    assert.match(settings, new RegExp(`SCREENS\\.${route}`));
  }
  assert.match(settings, /handleDeleteAccount/);
  assert.match(src("src/screens/settings/useSettingsActions.js"), /SCREENS\.ACCOUNT_DELETE/);
});

test("privacy hub opens legal documents, data export, and account deletion", () => {
  const privacy = src("src/screens/settings/PrivacyScreen.js");

  assert.match(privacy, /openDoc\("privacy"\)/);
  assert.match(privacy, /openDoc\("terms"\)/);
  assert.match(privacy, /SCREENS\.DATA_EXPORT/);
  assert.match(privacy, /handleDeleteAccount/);
});

test("notification inbox is reachable and does not ship fake social/news data", () => {
  const screens = src("src/constants/screens.js");
  const registry = src("src/navigation/screenRegistry.js");
  const tabs = src("src/navigation/tabAssignment.js");
  const routes = src("src/navigation/routes.js");
  const settings = src("src/screens/settings/NotificationsSettingsScreen.js");
  const inbox = src("src/screens/notifications/NotificationsScreen.js");

  assert.match(screens, /NOTIFICATIONS: "Notifications"/);
  assert.match(registry, /NotificationsScreen/);
  assert.match(tabs, /SCREENS\.NOTIFICATIONS/);
  assert.match(routes, /SCREENS\.NOTIFICATIONS/);
  assert.match(settings, /SCREENS\.NOTIFICATIONS/);

  assert.doesNotMatch(inbox, /INITIAL_NOTIFS|Mock data|Bugünkü durağın hazır|Sonuç rotayı değiştirdi/);
  assert.match(inbox, /Şimdilik yeni haber yok/);
  assert.match(inbox, /name="chevL"/);
});

test("goal editor keeps exam date reachable from the same settings flow", () => {
  const goals = src("src/screens/settings/GoalsScreen.js");

  assert.match(goals, /Sınav tarihi/);
  assert.match(goals, /SCREENS\.EXAM_DATE/);
});

test("profile edit target department row does not point to a missing picker", () => {
  const profile = src("src/screens/settings/EditProfileScreen.js");

  assert.match(profile, /HEDEF BÖLÜM/);
  assert.match(profile, /SCREENS\.GOALS/);
  assert.doesNotMatch(profile, /SCREENS\.DEPARTMENT|DepartmentPicker|TargetDepartmentPicker/);
});
