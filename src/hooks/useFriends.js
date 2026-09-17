import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  searchUsers,
  sendFriendRequest,
  respondToRequest,
  unfriend,
  cancelRequest,
  blockUser,
  listBlockedUsers,
} from "../supabase/friends";
import { captureError } from "../lib/errorReporting";
import * as H from "../lib/haptics";

export function useFriends({ showAlert } = {}) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [requests, setRequests] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(null);
  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId || userId === "dev") {
      setFriends([]);
      setRequests([]);
      setOutgoing([]);
      setBlockedIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [f, r, o, blocked] = await Promise.all([
        listFriends(userId),
        listIncomingRequests(userId),
        listOutgoingRequests(userId),
        listBlockedUsers(userId),
      ]);
      setFriends(f);
      setRequests(r);
      setOutgoing(o);
      setBlockedIds(new Set((blocked || []).map((b) => b.id)));
    } catch (e) {
      captureError(e, { context: "friends_load" });
      showAlert?.("Yüklenemedi", "Arkadaş listesi alınamadı. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  }, [showAlert, userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchUsers(query);
        if (!cancelled) {
          setSearchResults((res || []).filter((u) => u.id !== userId && !blockedIds.has(u.id)));
        }
      } catch (e) {
        captureError(e, { context: "friends_search" });
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [blockedIds, query, userId]);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const outgoingIds = useMemo(() => new Set(outgoing.map((o) => o.addressee?.id).filter(Boolean)), [outgoing]);
  const incomingIds = useMemo(() => new Set(requests.map((r) => r.requester?.id).filter(Boolean)), [requests]);

  const addFriend = useCallback(async (targetId) => {
    if (sending) return;
    setSending(targetId);
    try {
      await sendFriendRequest(targetId);
      H.success();
      showAlert?.("İstek gönderildi", "Arkadaşlık isteğin iletildi.");
      load();
    } catch (e) {
      showAlert?.("Hata", e.message || "İstek gönderilemedi.");
    } finally {
      setSending(null);
    }
  }, [load, sending, showAlert]);

  const cancelOutgoing = useCallback(async (friendshipId) => {
    try {
      await cancelRequest(friendshipId, userId);
      H.select();
      load();
    } catch (e) {
      showAlert?.("Hata", e.message || "İşlem başarısız.");
    }
  }, [load, showAlert, userId]);

  const respond = useCallback(async (id, accept) => {
    try {
      await respondToRequest(id, accept, userId);
      load();
    } catch (e) {
      showAlert?.("Hata", e.message || "İşlem başarısız.");
    }
  }, [load, showAlert, userId]);

  const removeFriend = useCallback((friendshipId) => {
    if (!userId) return;
    H.warn();
    showAlert?.("Arkadaşlıktan çıkar", "Bu kişiyi listenden kaldır?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Kaldır",
        style: "destructive",
        onPress: async () => {
          try {
            await unfriend(friendshipId, userId);
            load();
          } catch (e) {
            captureError(e, { context: "friends_remove" });
          }
        },
      },
    ]);
  }, [load, showAlert, userId]);

  const block = useCallback((targetUser) => {
    H.warn();
    showAlert?.("Kullanıcıyı Engelle", `${targetUser.name || "Bu kullanıcı"} engellensin mi? Arkadaşlık da kaldırılacak.`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Engelle",
        style: "destructive",
        onPress: async () => {
          try {
            await blockUser(targetUser.id);
            H.success();
            load();
          } catch (e) {
            showAlert?.("Hata", e.message || "Engellenemedi.");
          }
        },
      },
    ]);
  }, [load, showAlert]);

  return {
    friends,
    requests,
    outgoing,
    query,
    setQuery,
    searchResults,
    loading,
    searching,
    sending,
    friendIds,
    outgoingIds,
    incomingIds,
    load,
    addFriend,
    cancelOutgoing,
    respond,
    removeFriend,
    block,
  };
}
