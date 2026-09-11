import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { useCurriculum } from "./useCurriculum";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { searchTopics, searchWrongQuestions, suggestedQuery } from "../lib/searchIndex";

const RECENT_LIMIT = 6;
const recentKey = (userId) => `search:recent:${userId || "anon"}`;

export function useAppSearch() {
  const { user } = useAuth();
  const { subjects, loading: curriculumLoading } = useCurriculum();
  const [query, setQuery] = useState("");
  const [wrongRows, setWrongRows] = useState([]);
  const [recent, setRecent] = useState([]);

  // Yanlislar bir kez cekilir; her tusa basista istek atilmaz.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id || user.id === "dev") return undefined;
    getWrongQuestions(user.id)
      .then((rows) => { if (!cancelled) setWrongRows(rows || []); })
      .catch(() => { if (!cancelled) setWrongRows([]); });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(recentKey(user?.id))
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecent(parsed.slice(0, RECENT_LIMIT));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const remember = useCallback((term) => {
    const value = String(term || "").trim();
    if (value.length < 2) return;
    setRecent((current) => {
      const next = [value, ...current.filter((t) => t !== value)].slice(0, RECENT_LIMIT);
      AsyncStorage.setItem(recentKey(user?.id), JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [user?.id]);

  const clearRecent = useCallback(() => {
    setRecent([]);
    AsyncStorage.removeItem(recentKey(user?.id)).catch(() => {});
  }, [user?.id]);

  const topics = useMemo(() => searchTopics(subjects, query), [subjects, query]);
  const wrongs = useMemo(() => searchWrongQuestions(wrongRows, query), [wrongRows, query]);

  const trimmed = query.trim();
  return {
    query,
    setQuery,
    clear: useCallback(() => setQuery(""), []),
    topics,
    wrongs,
    recent,
    remember,
    clearRecent,
    loading: curriculumLoading,
    hasQuery: trimmed.length > 0,
    noResults: trimmed.length > 0 && topics.length === 0 && wrongs.length === 0,
    suggestion: suggestedQuery(query),
  };
}
