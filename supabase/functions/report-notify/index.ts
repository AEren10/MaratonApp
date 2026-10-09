/// <reference lib="deno.ns" />

// Yeni kullanici bildirimi (content_reports / avatar_reports) gelince
// destekmaraton@gmail.com'a e-posta. Uygulama bildirene "24 saat icinde
// incelenir" diyor (App Store 1.2); bildirimler yalniz tabloya dusuyordu.
// Cagiran: Supabase Database Webhook (INSERT). Yalniz servis anahtariyla
// gelen istek kabul edilir; giris yapmis bir kullanici e-posta yagdiramaz.
// Sirlar: RESEND_API_KEY (zorunlu), REPORT_EMAIL_TO (varsayilan destek adresi).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const TO = Deno.env.get("REPORT_EMAIL_TO") ?? "destekmaraton@gmail.com";
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];

type Row = Record<string, string | null>;
type Payload = { type?: string; table?: string; record?: Row };

const esc = (v: unknown) => String(v ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

async function nameOf(db: ReturnType<typeof createClient>, kind: string, id: string | null) {
  if (!id) return "";
  const table = kind === "group" ? "groups" : "profiles";
  const { data } = await db.from(table).select("name").eq("id", id).maybeSingle();
  return (data as { name?: string } | null)?.name ?? "";
}

Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization") ?? "";
  if (!SERVICE_KEY || auth !== `Bearer ${SERVICE_KEY}`) return new Response("forbidden", { status: 403 });
  if (!RESEND_API_KEY) return new Response("RESEND_API_KEY missing", { status: 500 });

  const body = (await req.json().catch(() => ({}))) as Payload;
  const rec = body.record ?? {};
  if (body.type !== "INSERT" || !rec) return new Response("ignored", { status: 200 });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);
  const avatar = body.table === "avatar_reports";
  const kind = avatar ? "user" : rec.target_type ?? "content";
  const [targetName, reporterName] = await Promise.all([
    nameOf(db, kind, rec.target_id), nameOf(db, "user", rec.reporter_id),
  ]);

  const what = avatar ? "Profil fotoğrafı" : kind === "group" ? "Grup" : kind === "user" ? "Kullanıcı" : kind;
  const subject = `Maraton bildirim: ${what}${targetName ? ` · ${targetName}` : ""}`;
  const tableUrl = `https://supabase.com/dashboard/project/${PROJECT_REF}/editor`;
  const lines: [string, unknown][] = [
    ["Tür", what],
    ["Bildirilen", `${targetName || "-"} (${rec.target_id ?? "-"})`],
    ["Sebep", avatar ? "fotoğraf" : rec.reason],
    ["İçerik", rec.snapshot ?? rec.avatar_url ?? "-"],
    ["Bildiren", `${reporterName || "-"} (${rec.reporter_id ?? "-"})`],
    ["Zaman", rec.created_at],
  ];
  const html = `<p><b>Yeni bildirim</b> — 24 saat içinde incele.</p><table>${
    lines.map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td>${esc(v)}</td></tr>`).join("")
  }</table><p><a href="${tableUrl}">Supabase tablosunu aç (${body.table})</a></p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Maraton <onboarding@resend.dev>", to: [TO], subject, html }),
  });
  if (!res.ok) return new Response(`resend ${res.status}: ${await res.text()}`, { status: 502 });
  return new Response("ok", { status: 200 });
});
