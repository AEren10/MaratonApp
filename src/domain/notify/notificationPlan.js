import { dailyReminderContent } from "../../lib/reminderContent.js";
import {
  comebackCopy, dailyGeneric, milestoneCopy, monthlyCopy, streakCopy, trialCopy, unfinishedCopy, weeklyCopy,
  weeklyShareCopy, widgetTipCopy,
} from "./notificationCopy.js";

// BILDIRIM PLANI -- saf. Uygulama her acilista ve gunun plani degistiginde
// tum yonetilen bildirimleri iptal edip bu listeyi yeniden kurar. Boylece
// kullanici uygulamayi actikca "gelecekteki" bildirimler hep tazelenir;
// acmazsa en son kurulan merdiven isler (sunucu gerekmez).
//
// Kurallar:
// - Gunde en fazla 2 bildirim: gunun ana bildirimi (aliskanlik saati) ve
//   AKSAM bildirimi (gun bitmediyse; seri >= 3 ise seri dili). Ayni dilime
//   dusenlerden onceligi yuksek olan kalir. Gun bitince aksamki kurulmaz.
// - Sessiz saat: 08:00 oncesi ve 22:00 ve sonrasi hicbir sey kurulmaz.
// - Gunun isi bittiyse o gunun hatirlatmasi yok (reminderContent).
// - Merdiven: yarin (gunluk), 3., 7. ve 14. gun. Sonrasi sessiz; yalniz
//   sinav takvimindeki donum noktalari gider.

export const PLAN_TYPES = ["daily_reminder", "day_unfinished", "comeback", "streak_risk", "weekly_summary", "weekly_share", "monthly_summary", "trial_reminder", "exam_milestone", "widget_tip"];
const EVENING = new Set(["streak_risk", "day_unfinished"]);
const PRIORITY = { widget_tip: 0, day_unfinished: 1, streak_risk: 2, daily_reminder: 1, monthly_summary: 2, trial_reminder: 2, weekly_summary: 3, weekly_share: 3, comeback: 4, exam_milestone: 5 };
// Iyi hafta esigi: haftalik bildirim ozet yerine paylasima davet olur.
const SHARE_MINUTES = 120;
const MILESTONES = [150, 100, 60, 30, 7];
const HORIZON_DAYS = 120;
const QUIET_START = 8 * 60;
// 22:00 ve sonrasi sessiz: en gec 21:45 (kaydirma payi dahil).
const QUIET_END = 21 * 60 + 45;
const DAY = 86400000;

export const dayKeyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDay = (key) => { const [y, m, d] = String(key).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };

export function buildNotificationPlan({ now = new Date(), prefs = {}, context = {}, habitHour = 19, jitter = () => 0 } = {}) {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const at = (dayOffset, hour, minute, type) => {
    const total = Math.max(QUIET_START, Math.min(QUIET_END, hour * 60 + minute + (jitter(type) || 0)));
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, Math.floor(total / 60), total % 60, 0);
  };
  const future = (d) => d.getTime() > now.getTime();
  const examDay = context.exam?.date ? parseDay(context.exam.date) : null;
  const daysLeftAt = (d) => (examDay ? Math.round((examDay - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY) : 0);
  const next = context.todayPlan?.next?.label || null;
  const items = [];
  const push = (type, date, copy, screen, params) => {
    if (copy && future(date)) items.push({ type, date, title: copy.title, body: copy.body, screen, params });
  };

  if (prefs.dailyReminderEnabled) {
    const today = at(0, habitHour, 0, "daily_reminder");
    const content = dailyReminderContent(context, dayKeyOf(today), null);
    push("daily_reminder", today, content ?? (context.todayPlan?.day === dayKeyOf(today) ? null : dailyGeneric(0, daysLeftAt(today))),
      content?.kind === "review" ? "review" : "plan");
    const tomorrow = at(1, habitHour, 0, "daily_reminder");
    push("daily_reminder", tomorrow, dailyGeneric(tomorrow.getDate(), daysLeftAt(tomorrow)), "plan");
    for (const step of [3, 7, 14]) {
      const d = at(step, habitHour, 0, "comeback");
      push("comeback", d, comebackCopy(step, { daysLeft: daysLeftAt(d), next }), "plan");
    }
  }

  // Aksam dilimi: bugun icin seri ya da "gun bitmedi"; yarin icin yalniz seri.
  const open = context.todayPlan?.day === dayKeyOf(base) ? Number(context.todayPlan.open) || 0 : null;
  const streakOn = prefs.streakRiskEnabled && Number(context.streak) >= 3 && context.studiedToday !== undefined;
  const tonight = at(0, 21, 0, "evening");
  if (streakOn && !context.studiedToday) {
    push("streak_risk", tonight, streakCopy(context.streak, next), "plan");
  } else if (prefs.dailyReminderEnabled && open > 0) {
    push("day_unfinished", tonight, unfinishedCopy(open, next, Boolean(context.studiedToday)), "plan");
  }
  // Bugun calistiysa seri yarin aksam riskte; calismadiysa bu aksamki yeter
  // (uygulama yeniden acilinca plan zaten tazelenir).
  if (streakOn && context.studiedToday) push("streak_risk", at(1, 21, 0, "evening"), streakCopy(Number(context.streak), null), "plan");

  if (prefs.weeklySummaryEnabled !== false) {
    const toSunday = (7 - base.getDay()) % 7;
    let d = at(toSunday, 20, 0, "weekly_summary");
    const thisWeek = future(d);
    if (!thisWeek) d = at(toSunday + 7, 20, 0, "weekly_summary");
    const vars = thisWeek ? context.weeklyVars || {} : {};
    // Sayilar yalniz o pazar olculduyse yazilir; daha eskiyse hafta eksik
    // gorunurdu (dakika yalniz artar: "iyi hafta" karari icin alt sinir yeter).
    const fresh = vars.day === dayKeyOf(d);
    const shown = fresh ? vars : {};
    if (Number(vars.minutes) >= SHARE_MINUTES) push("weekly_share", d, weeklyShareCopy(shown), "share");
    else push("weekly_summary", d, weeklyCopy(shown), "summary");
  }

  // Widget ipucu: tarihi cagiran BIR KEZ sabitler (her acilista ileri
  // kaymasin); ayni gun baska bildirim varsa o kazanir (oncelik 0).
  if (context.widgetTipAt) {
    push("widget_tip", new Date(context.widgetTipAt), widgetTipCopy(), "widget");
  }

  if (Number(context.trials?.count) >= 2) {
    const first = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    const offset = Math.round((first - base) / DAY);
    push("monthly_summary", at(offset, 19, 30, "monthly_summary"), monthlyCopy(base.getMonth()), "comparative");
  }

  if (prefs.trialReminderEnabled && context.trials?.lastDay) {
    const since = Math.round((base - parseDay(context.trials.lastDay)) / DAY);
    const toThursday = ((4 - base.getDay()) + 7) % 7 || 7;
    const offset = since >= 7 ? toThursday : Math.max(1, 8 - since);
    push("trial_reminder", at(offset, 18, 0, "trial_reminder"), trialCopy(since + offset), "trial");
  }

  if (examDay) {
    for (const days of MILESTONES) {
      if ((days === 150 || days === 60) && !context.exam.ayt) continue;
      const offset = Math.round((examDay - base) / DAY) - days;
      if (offset < 0 || offset > HORIZON_DAYS) continue;
      push("exam_milestone", at(offset, 19, 0, "exam_milestone"), milestoneCopy(days, context.exam.ayt),
        days === 150 || days === 60 ? "route" : "plan");
    }
  }

  return capPerDay(items).sort((a, b) => a.date - b.date);
}

// Her gun iki dilim: ana ve aksam. Dilim basina en oncelikli bildirim kalir.
// Widget ipucu kendi (ogle) diliminde, ama o gun zaten iki bildirim varsa
// gonderilmez: gunde en fazla iki sozu bozulmaz.
function capPerDay(items) {
  const best = new Map();
  for (const item of items) {
    const slot = item.type === "widget_tip" ? "tip" : EVENING.has(item.type) ? "evening" : "main";
    const key = `${dayKeyOf(item.date)}:${slot}`;
    const cur = best.get(key);
    if (!cur || PRIORITY[item.type] > PRIORITY[cur.type]) best.set(key, item);
  }
  const kept = [...best.values()];
  const perDay = {};
  for (const i of kept) if (i.type !== "widget_tip") perDay[dayKeyOf(i.date)] = (perDay[dayKeyOf(i.date)] || 0) + 1;
  return kept.filter((i) => i.type !== "widget_tip" || (perDay[dayKeyOf(i.date)] || 0) < 2);
}
