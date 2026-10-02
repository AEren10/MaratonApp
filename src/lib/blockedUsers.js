import { useEffect, useState } from "react";

import { listBlockedUsers } from "../supabase/friends";
import { registerSessionReset } from "./session/sessionReset";

// Engellenenler: siralama ve grup listelerinden ayiklanir (Apple 1.2:
// engellenen kullanicinin icerigi gorunmez). Tek kopya, abonelerle.
let ids = null;
const subs = new Set();
const emit = () => subs.forEach((fn) => fn(ids));
registerSessionReset(() => { ids = null; emit(); });

export function markBlocked(id) {
  ids = new Set([...(ids || []), id]);
  emit();
}

export function useBlockedIds(userId) {
  const [state, setState] = useState(ids || new Set());
  useEffect(() => {
    subs.add(setState);
    if (!ids && userId) {
      listBlockedUsers(userId)
        .then((rows) => { ids = new Set((rows || []).map((r) => r.id)); emit(); })
        .catch(() => {});
    }
    return () => { subs.delete(setState); };
  }, [userId]);
  return state;
}
