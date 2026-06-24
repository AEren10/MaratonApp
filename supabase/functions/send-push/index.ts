import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
  channelId?: string;
}

interface ReengagementPayload {
  type: "inactive_3d" | "streak_risk" | "weekly_summary" | "custom";
  title?: string;
  body?: string;
  data?: Record<string, string>;
  user_ids?: string[];
}

const TEMPLATES: Record<string, { title: string; body: string; data: Record<string, string> }> = {
  inactive_3d: {
    title: "Seni ozledik!",
    body: "3 gundur calisma kaydetmedin. Hedefe kalan her gun onemli!",
    data: { url: "maraton://home" },
  },
  streak_risk: {
    title: "Streak'in tehlikede!",
    body: "Bugun hic calisma kaydetmedin. Seriyi bozma!",
    data: { url: "maraton://home" },
  },
  weekly_summary: {
    title: "Haftalik raporun hazir",
    body: "Bu haftanin ozetine goz at, gelisimini incele!",
    data: { url: "maraton://weekly-review" },
  },
};

async function sendBatch(messages: PushMessage[]): Promise<void> {
  const resp = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Expo push error:", resp.status, text);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const expectedAuth = `Bearer ${serviceKey}`;
  if (authHeader !== expectedAuth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload: ReengagementPayload = await req.json();
  const { type, title, body, data, user_ids } = payload;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabase = createClient(supabaseUrl, serviceKey!);

  let query = supabase
    .from("profiles")
    .select("id, expo_push_token")
    .not("expo_push_token", "is", null);

  if (user_ids && user_ids.length > 0) {
    query = query.in("id", user_ids);
  } else if (type === "inactive_3d") {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    query = query.lt("last_active", threeDaysAgo);
  } else if (type === "streak_risk") {
    const today = new Date().toISOString().split("T")[0];
    query = query.lt("last_active", today);
  }

  const { data: users, error } = await query;
  if (error) {
    console.error("DB query error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!users || users.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const template = TEMPLATES[type] || {};
  const msgTitle = title || template.title || "Maraton";
  const msgBody = body || template.body || "";
  const msgData = data || template.data || {};

  const messages: PushMessage[] = users
    .filter((u) => u.expo_push_token?.startsWith("ExponentPushToken["))
    .map((u) => ({
      to: u.expo_push_token,
      title: msgTitle,
      body: msgBody,
      data: msgData,
      sound: "default",
      channelId: "default",
    }));

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    await sendBatch(batch);
  }

  return new Response(JSON.stringify({ sent: messages.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
