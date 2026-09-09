import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { listFriends } from "../supabase/friends";
import {
  getRouteCompanionDashboard,
  endRouteCompanion,
  listRouteCompanions,
  respondRouteCompanion,
  requestRouteCompanion,
} from "../supabase/routeCompanions";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";

export function useRouteCompanion() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setItems([]);
      setDashboard(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [next, acceptedFriends] = await Promise.all([
        listRouteCompanions(user.id),
        listFriends(user.id),
      ]);
      setItems(next);
      const existingIds = new Set(next
        .filter((item) => ["pending", "active"].includes(item.status))
        .map((item) => item.companion?.id));
      setFriends(acceptedFriends.filter((friend) => !existingIds.has(friend.id)));
      const active = next.find((item) => item.status === "active");
      setDashboard(active ? await getRouteCompanionDashboard(active.id) : null);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const respond = useCallback(async (id, accept) => {
    try {
      setError(null);
      await respondRouteCompanion(id, accept);
      track(EVENTS.ROUTE_COMPANION_RESPONDED, { accepted: accept });
      await load();
    } catch (nextError) { setError(nextError); }
  }, [load]);

  const end = useCallback(async (id) => {
    try {
      setError(null);
      await endRouteCompanion(id);
      track(EVENTS.ROUTE_COMPANION_ENDED);
      await load();
    } catch (nextError) { setError(nextError); }
  }, [load]);

  const request = useCallback(async (otherId) => {
    try {
      setError(null);
      await requestRouteCompanion(otherId);
      track(EVENTS.ROUTE_COMPANION_REQUESTED);
      await load();
    } catch (nextError) { setError(nextError); }
  }, [load]);

  return { dashboard, end, error, friends, items, loading, refresh: load, request, respond };
}
