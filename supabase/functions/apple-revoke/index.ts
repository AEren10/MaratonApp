/// <reference lib="deno.ns" />

// Hesap silinirken "Apple ile giris" baglantisini Apple tarafinda da iptal
// eder (App Store 5.1.1(v)). Istemci silmeden hemen once Apple'dan taze bir
// authorizationCode alir ve buraya yollar; kod refresh token'a cevrilir,
// o token iptal edilir. Token saklanmaz.
// Sirlar: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (.p8 icerigi),
// APPLE_CLIENT_ID (varsayilan: bundle id). Sirlar yoksa { skipped: true }
// doner; silme akisi bu yuzden durmaz.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "https://esm.sh/jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const TEAM_ID = Deno.env.get("APPLE_TEAM_ID") ?? "";
const KEY_ID = Deno.env.get("APPLE_KEY_ID") ?? "";
const PRIVATE_KEY = (Deno.env.get("APPLE_PRIVATE_KEY") ?? "").replace(/\n/g, "\n");
const CLIENT_ID = Deno.env.get("APPLE_CLIENT_ID") ?? "com.ahmeterensiranli.maraton";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function clientSecret() {
  const key = await importPKCS8(PRIVATE_KEY, "ES256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: KEY_ID })
    .setIssuer(TEAM_ID)
    .setSubject(CLIENT_ID)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

const form = (fields: Record<string, string>) => ({
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(fields),
});

Deno.serve(async (req) => {
  const db = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: auth } = await db.auth.getUser();
  if (!auth?.user) return json({ error: "unauthorized" }, 401);

  const { authorizationCode } = (await req.json().catch(() => ({}))) as { authorizationCode?: string };
  if (!authorizationCode) return json({ error: "authorizationCode missing" }, 400);
  if (!TEAM_ID || !KEY_ID || !PRIVATE_KEY) return json({ skipped: true });

  const secret = await clientSecret();
  const tokenRes = await fetch("https://appleid.apple.com/auth/token", form({
    client_id: CLIENT_ID, client_secret: secret, code: authorizationCode, grant_type: "authorization_code",
  }));
  const token = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !token.refresh_token) return json({ error: "token_exchange_failed" }, 502);

  const revokeRes = await fetch("https://appleid.apple.com/auth/revoke", form({
    client_id: CLIENT_ID, client_secret: secret, token: token.refresh_token, token_type_hint: "refresh_token",
  }));
  return revokeRes.ok ? json({ revoked: true }) : json({ error: "revoke_failed" }, 502);
});
