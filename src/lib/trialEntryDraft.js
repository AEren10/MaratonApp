import { getJson, setJson, remove } from "./storage/appStorage";

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function keyFor(userId) {
  return `trial_entry_draft:${userId || "anon"}`;
}

export async function loadTrialEntryDraft(userId) {
  const draft = await getJson(keyFor(userId));
  if (!draft || typeof draft !== "object") return null;
  if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
    await remove(keyFor(userId));
    return null;
  }
  return draft;
}

export async function saveTrialEntryDraft(userId, data) {
  await setJson(keyFor(userId), { ...data, savedAt: Date.now() });
}

export async function clearTrialEntryDraft(userId) {
  await remove(keyFor(userId));
}
