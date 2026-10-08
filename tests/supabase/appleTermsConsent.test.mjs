import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hook = readFileSync("src/hooks/useSocialAuth.js", "utf8");
const buttons = readFileSync("src/screens/auth/components/SocialAuthButtons.js", "utf8");
const login = readFileSync("src/screens/auth/LoginScreen.js", "utf8");
const register = readFileSync("src/screens/auth/RegisterScreen.js", "utf8");

test("Apple auth refuses to open without explicit legal consent", () => {
  assert.match(hook, /signInWithApple = useCallback\(async \(\{ termsAccepted = false \} = \{\}\)/);
  assert.match(hook, /if \(!termsAccepted\)/);
  assert.match(hook, /error\.code = "TERMS_REQUIRED"/);
  assert.match(buttons, /signInWithApple\(\{ termsAccepted \}\)/);
});

test("register and login Apple entry points both provide the consent state", () => {
  assert.match(register, /termsAccepted=\{agreed\}/);
  assert.match(login, /const \[appleTermsAccepted, setAppleTermsAccepted\] = useState\(false\)/);
  assert.match(login, /<TermsCheckbox[\s\S]{0,700}termsAccepted=\{appleTermsAccepted\}/);
  assert.match(login, /SCREENS\.TERMS/);
  assert.match(login, /SCREENS\.PRIVACY/);
});
