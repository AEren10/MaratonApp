import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { SIGN_UP_OUTCOME, signUpOutcome } from "../../src/lib/signUpOutcome.js";

test("oturum donduyse kayit ekrani bir sey yapmaz (navigator kuruluma gecer)", () => {
  assert.equal(signUpOutcome({ user: { id: "u" }, session: { access_token: "t" } }), SIGN_UP_OUTCOME.SIGNED_IN);
});

test("dogrulama aciksa oturum gelmez: kullanici girise yonlendirilir", () => {
  assert.equal(signUpOutcome({ user: { id: "u" }, session: null }), SIGN_UP_OUTCOME.CONFIRM_EMAIL);
  assert.equal(signUpOutcome(null), SIGN_UP_OUTCOME.CONFIRM_EMAIL);
});

test("kayit ve giris kirpilmis e-postayla yapilir", () => {
  const register = readFileSync("src/screens/auth/RegisterScreen.js", "utf8");
  const login = readFileSync("src/screens/auth/LoginScreen.js", "utf8");
  assert.match(register, /signUp\(\{ email: email\.trim\(\)/);
  assert.match(login, /signIn\(\{ email: email\.trim\(\)/);
  assert.doesNotMatch(register, /e-postanı doğrulamayı unutma/);
});
