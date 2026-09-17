import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const groupsTab = readFileSync(new URL("../../src/screens/league/GroupsTab.js", import.meta.url), "utf8");
const friendCodeCard = readFileSync(
  new URL("../../src/screens/social/components/FriendCodeCard.js", import.meta.url),
  "utf8",
);
// Davet mantigi ekrandan useReferrals hook'una tasindi; olay garantisi orada.
const referrals = readFileSync(new URL("../../src/hooks/useReferrals.js", import.meta.url), "utf8");

test("group invite share link passes groupCode to the route path", () => {
  assert.match(groupsTab, /appUrl\(SCREENS\.LEAGUE, \{ groupCode: g\.code \}\)/);
  assert.doesNotMatch(groupsTab, /appUrl\(SCREENS\.LEAGUE, \{ code:/);
});

test("friend invite share link passes friendCode to the route path", () => {
  assert.match(friendCodeCard, /appUrl\(SCREENS\.FRIENDS, \{ friendCode: myCode \}\)/);
  assert.doesNotMatch(friendCodeCard, /appUrl\(SCREENS\.FRIENDS, \{ code:/);
});

test("referral share emits the growth funnel event", () => {
  assert.match(referrals, /import \{ track \} from "\.\.\/lib\/analytics"/);
  assert.match(referrals, /import \{ EVENTS \} from "\.\.\/constants\/analytics"/);
  assert.match(referrals, /track\(EVENTS\.REFERRAL_LINK_SHARED, \{ source: "referral_screen", examType \}\)/);
});

test("successful referral apply emits the conversion event", () => {
  assert.match(referrals, /if \(result\.ok\) \{\s*H\.success\(\);\s*track\(EVENTS\.REFERRAL_LINK_APPLIED/);
  assert.match(referrals, /source: "referral_screen",\s*entry: routeCode \? "deep_link" : "manual_entry"/);
});
