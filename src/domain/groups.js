const GROUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function weekStartIstanbul(input = new Date()) {
  const dt = typeof input === "string" ? new Date(input) : new Date(input);
  const tr = new Date(dt.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const day = tr.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  tr.setDate(tr.getDate() + diff);
  tr.setHours(0, 0, 0, 0);
  const y = tr.getFullYear();
  const m = String(tr.getMonth() + 1).padStart(2, "0");
  const d = String(tr.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function normalizeGroupCode(value = "") {
  return String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateGroupCode(randomBytes, length = 6) {
  if (!randomBytes || randomBytes.length < length) {
    throw new Error("randomBytes must contain at least length bytes");
  }
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += GROUP_CODE_ALPHABET[randomBytes[i] % GROUP_CODE_ALPHABET.length];
  }
  return code;
}

export function rankGroupMembers(members = []) {
  return [...members]
    .map((member) => ({
      ...member,
      weekly_questions: Number(member.weekly_questions ?? member.questions ?? 0) || 0,
    }))
    .sort((a, b) => (
      b.weekly_questions - a.weekly_questions ||
      String(a.joined_at || "").localeCompare(String(b.joined_at || "")) ||
      String(a.user_id || a.id || "").localeCompare(String(b.user_id || b.id || ""))
    ))
    .map((member, index) => ({ ...member, rank: index + 1 }));
}

export function groupWeeklyGoalSummary(group = {}, members = []) {
  const weeklyQuestions = members.reduce(
    (sum, member) => sum + (Number(member.weekly_questions ?? member.questions ?? 0) || 0),
    0,
  );
  const weeklyTarget = Math.max(0, Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0);
  return {
    weekly_questions: weeklyQuestions,
    weekly_target: weeklyTarget,
    progress: weeklyTarget > 0 ? Math.min(1, weeklyQuestions / weeklyTarget) : 0,
    remaining: Math.max(0, weeklyTarget - weeklyQuestions),
  };
}
