import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const groupsTab = readFileSync(new URL("../../src/screens/league/GroupsTab.js", import.meta.url), "utf8");
const friendCodeCard = readFileSync(
  new URL("../../src/screens/social/components/FriendCodeCard.js", import.meta.url),
  "utf8",
);
const referralScreen = readFileSync(new URL("../../src/screens/social/ReferralScreen.js", import.meta.url), "utf8");

test("group invite share link passes groupCode to the route path", () => {
  assert.match(groupsTab, /appUrl\(SCREENS\.LEAGUE, \{ groupCode: g\.code \}\)/);
  assert.doesNotMatch(groupsTab, /appUrl\(SCREENS\.LEAGUE, \{ code:/);
});

test("friend invite share link passes friendCode to the route path", () => {
  assert.match(friendCodeCard, /appUrl\(SCREENS\.FRIENDS, \{ friendCode: myCode \}\)/);
  assert.doesNotMatch(friendCodeCard, /appUrl\(SCREENS\.FRIENDS, \{ code:/);
});

test("referral share emits the growth funnel event", () => {
  assert.match(referralScreen, /import \{ track \} from "\.\.\/\.\.\/lib\/analytics"/);
  assert.match(referralScreen, /import \{ EVENTS \} from "\.\.\/\.\.\/constants\/analytics"/);
  assert.match(referralScreen, /track\(EVENTS\.REFERRAL_LINK_SHARED, \{ source: "referral_screen", examType \}\)/);
});

test("successful referral apply emits the conversion event", () => {
  assert.match(referralScreen, /if \(result\.ok\) \{\s*H\.success\(\);\s*track\(EVENTS\.REFERRAL_LINK_APPLIED/);
  assert.match(referralScreen, /source: "referral_screen",\s*entry: route\.params\?\.code \? "deep_link" : "manual_entry"/);
});
