import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const friendsScreen = readFileSync(new URL("../../src/screens/social/FriendsScreen.js", import.meta.url), "utf8");
const referralScreen = readFileSync(new URL("../../src/screens/social/ReferralScreen.js", import.meta.url), "utf8");
const useFriends = readFileSync(new URL("../../src/hooks/useFriends.js", import.meta.url), "utf8");
const useReferrals = readFileSync(new URL("../../src/hooks/useReferrals.js", import.meta.url), "utf8");

test("friends screen delegates Supabase/state work to useFriends", () => {
  assert.match(friendsScreen, /useFriends\(\{ showAlert \}\)/);
  assert.doesNotMatch(friendsScreen, /from "\.\.\/\.\.\/supabase\/friends"/);
  assert.match(useFriends, /listFriends\(userId\)/);
  assert.match(useFriends, /searchUsers\(query\)/);
  assert.match(useFriends, /sendFriendRequest\(targetId\)/);
});

test("referral screen delegates Supabase/state work to useReferrals", () => {
  assert.match(referralScreen, /useReferrals\(\{ routeCode: route\.params\?\.code, examType, showAlert \}\)/);
  assert.doesNotMatch(referralScreen, /from "\.\.\/\.\.\/supabase\/referrals"/);
  assert.match(useReferrals, /getOrCreateReferralCode\(userId\)/);
  assert.match(useReferrals, /getReferralStats\(userId\)/);
  assert.match(useReferrals, /applyReferralCode\(userId, friendCode\)/);
});
