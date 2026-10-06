import { getProfile } from "../supabase/profiles";

const RETRY_DELAYS_MS = [400, 1200];
const ATTEMPT_TIMEOUT_MS = 3000;

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("profile_load_timeout")), ATTEMPT_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Giris hemen sonrasi gecici bir hata (ag, oturum henuz hazir degil) profili
// "yok" saydirip kurulumu bastan actiriyordu. Uc deneme: 0 / 400 / 1200 ms.
export async function getProfileWithRetry(userId) {
  let lastError = null;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i += 1) {
    try {
      return await withTimeout(getProfile(userId));
    } catch (e) {
      lastError = e;
      if (i < RETRY_DELAYS_MS.length) await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[i]));
    }
  }
  throw lastError;
}
