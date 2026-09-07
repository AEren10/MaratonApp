/// <reference lib="deno.ns" />

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

type PushTemplate = {
  title: string;
  body: string;
  data: Record<string, string>;
};

// DİKKAT — bu URL'ler istemcideki src/navigation/routes.js yollarına ELLE
// karşılık gelir (appUrl() burada çalışmıyor, ayrı runtime).
// Doğrulandı 2026-09-07: home -> "home", weekly-review -> "weekly-review".
// routes.js'te bir yol değişirse BURASI DA değişmeli; aksi halde push
// bildirimi sessizce hiçbir ekrana gitmez.
const TEMPLATES: Record<ReengagementPayload["type"], PushTemplate> = {
  inactive_3d: {
    title: "Seni ozledik!",
    body: "3 gundur calisma kaydetmedin. Hedefe kalan her gun onemli!",
    data: { type: "inactive_3d", url: "maraton://home" },
  },
  streak_risk: {
    title: "Streak'in tehlikede!",
    body: "Bugun hic calisma kaydetmedin. Seriyi bozma!",
    data: { type: "streak_risk", url: "maraton://home" },
  },
  weekly_summary: {
    title: "Haftalik raporun hazir",
    body: "Bu haftanin ozetine goz at, gelisimini incele!",
    data: { type: "weekly_summary", url: "maraton://weekly-review" },
  },
};

const DEFAULT_TEMPLATE: PushTemplate = {
  title: "Maraton",
  body: "",
  data: {},
};

function notificationAllowed(type: ReengagementPayload["type"], prefs: unknown): boolean {
  const value = prefs && typeof prefs === "object" ? prefs as Record<string, unknown> : {};
  if (type === "streak_risk") return value.streakRiskEnabled !== false;
  if (type === "weekly_summary") return value.weeklySummaryEnabled !== false;
  if (type === "inactive_3d") return value.dailyReminderEnabled !== false;
  return true;
}

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

  const payload = await req.json() as ReengagementPayload;
  const { type, title, body, data, user_ids } = payload;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabase = createClient(supabaseUrl, serviceKey!);

  let query = supabase
    .from("profiles")
    .select("id, expo_push_token, notification_prefs")
    .not("expo_push_token", "is", null);

  if (user_ids && user_ids.length > 0) {
    query = query.in("id", user_ids);
  } else if (type === "inactive_3d") {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    query = query.lt("last_active", threeDaysAgo);
  } else if (type === "streak_risk") {
    // Gün sınırı TR saatiyle. toISOString() UTC verir; TR = UTC+3 olduğu için
    // gece 00:00-03:00 arasında aktif olan kullanıcı "dün aktif" sayılıp
    // seri-riski bildirimi alıyordu. sv-SE formatı YYYY-MM-DD döndürür.
    const todayTR = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Europe/Istanbul",
    });
    query = query.lt("last_active", `${todayTR}T00:00:00+03:00`);
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

  const template = TEMPLATES[type] ?? DEFAULT_TEMPLATE;
  const msgTitle = title || template.title || "Maraton";
  const msgBody = body || template.body || "";
  const msgData = data || template.data || {};

  const messages: PushMessage[] = users
    .filter((u) => u.expo_push_token?.startsWith("ExponentPushToken["))
    .filter((u) => notificationAllowed(type, u.notification_prefs))
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
