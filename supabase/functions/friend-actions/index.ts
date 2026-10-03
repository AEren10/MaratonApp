/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ActionPayload =
  | { action: "send"; addresseeId: string }
  | { action: "respond"; friendshipId: string; accept: boolean };

type MutationResult = {
  friendship_id: string;
  recipient_id: string | null;
  actor_name: string;
  notification_kind: "friend_request" | "friend_accepted" | null;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

function isPayload(value: unknown): value is ActionPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  if (body.action === "send") return typeof body.addresseeId === "string" && UUID_RE.test(body.addresseeId);
  return body.action === "respond"
    && typeof body.friendshipId === "string"
    && UUID_RE.test(body.friendshipId)
    && typeof body.accept === "boolean";
}

function friendlyError(message = ""): { message: string; status: number } {
  if (message.includes("friend_request_daily_limit")) {
    return { message: "Bugünkü arkadaşlık isteği sınırına ulaştın.", status: 429 };
  }
  if (message.includes("friend_interaction_blocked") || message.includes("friend_request_unavailable")) {
    return { message: "Bu kullanıcıyla etkileşim kurulamıyor.", status: 403 };
  }
  if (message.includes("friendship_already_exists")) {
    return { message: "Bu kullanıcıyla zaten bir arkadaşlık veya bekleyen istek var.", status: 409 };
  }
  return { message: "İşlem tamamlanamadı.", status: 400 };
}

async function sendPush(
  supabase: ReturnType<typeof createClient>,
  result: MutationResult,
): Promise<boolean> {
  if (!result.recipient_id || !result.notification_kind) return false;
  const { data: recipient } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("id", result.recipient_id)
    .maybeSingle();

  const token = recipient?.expo_push_token;
  if (typeof token !== "string"
    || (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken["))) {
    return false;
  }

  const request = result.notification_kind === "friend_request";
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      to: token,
      title: request ? "Arkadaşlık isteği" : "İstek kabul edildi",
      body: request
        ? `${result.actor_name} seni arkadaş olarak eklemek istiyor`
        : `${result.actor_name} isteğini kabul etti`,
      data: { type: result.notification_kind, url: "maraton://friend" },
      sound: "default",
      channelId: "default",
    }),
  });
  return response.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!supabaseUrl || !serviceKey) return json({ error: "server_not_configured" }, 500);
  if (!token) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "unauthorized" }, 401);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!isPayload(payload)) return json({ error: "invalid_payload" }, 400);

  const rpc = payload.action === "send"
    ? supabase.rpc("send_friend_request_server", {
      p_actor: authData.user.id,
      p_addressee: payload.addresseeId,
    })
    : supabase.rpc("respond_friend_request_server", {
      p_actor: authData.user.id,
      p_friendship_id: payload.friendshipId,
      p_accept: payload.accept,
    });

  const { data, error } = await rpc;
  if (error) {
    const failure = friendlyError(error.message);
    return json({ error: failure.message }, failure.status);
  }

  const result = data as MutationResult;
  const pushed = await sendPush(supabase, result).catch(() => false);
  return json({
    friendship: { id: result.friendship_id },
    accepted: payload.action === "respond" ? payload.accept : undefined,
    pushed,
  });
});
