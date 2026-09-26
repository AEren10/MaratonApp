import { useState, useEffect, useCallback, useMemo } from "react";
import { Share } from "react-native";

import { createGroup, joinByCode, listMyGroups, leaveGroup, groupLeaderboard } from "../../supabase/groups";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";
import { appUrl } from "../../navigation/routes";

export function useGroupsController({ user, initialGroupCode }) {
  const showAlert = useAlert();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [board, setBoard] = useState({ list: [] });
  const [boardError, setBoardError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await listMyGroups(user.id);
      setGroups(list);
      if (list.length && !selected) setSelected(list[0]);
    } catch {
      showAlert("Yüklenemedi", "Gruplar alınamadı. Tekrar dene.");
    }
    setLoading(false);
  }, [user?.id, selected, showAlert]);

  useEffect(() => { loadGroups(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialGroupCode || !user?.id) return;
    setBusy(true);
    joinByCode(initialGroupCode)
      .then(() => { H.success(); loadGroups(); })
      .catch(() => showAlert("Hata", "Grup kodu geçersiz veya zaten üyesin."))
      .finally(() => setBusy(false));
  }, [initialGroupCode, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBoard = useCallback(async () => {
    if (!selected?.id || !user?.id) return;
    setBoardError(null);
    try {
      setBoard(await groupLeaderboard(selected.id, user.id));
    } catch (e) {
      setBoardError(e?.message || "Sıralama yüklenemedi.");
    }
  }, [selected?.id, user?.id]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const standing = useMemo(() => {
    if (!board.list?.length) return null;
    const leader = board.list[0];
    const mine = board.list.find((m) => m.you);
    if (!mine) return null;
    const isLeader = mine.rank === 1;
    const second = board.list[1];
    const myQuestions = mine.weekly_questions ?? mine.questions ?? 0;
    const leaderQuestions = leader.weekly_questions ?? leader.questions ?? 0;
    const secondQuestions = second ? (second.weekly_questions ?? second.questions ?? 0) : 0;
    const diff = isLeader
      ? Math.max(0, myQuestions - secondQuestions)
      : Math.max(0, leaderQuestions - myQuestions);
    return {
      isLeader,
      rank: mine.rank,
      diff,
      leaderName: leader.name || "Lider",
      leaderQuestions,
    };
  }, [board.list]);

  const doCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const g = await createGroup(name);
      H.success();
      setCreateOpen(false);
      setName("");
      await loadGroups();
      setSelected(g);
      showAlert("Grup oluştu", `Kod: ${g.code}\nArkadaşlarınla paylaş!`);
    } catch {
      showAlert("Hata", "Grup oluşturulamadı.");
    }
    setBusy(false);
  };

  const doJoin = async () => {
    if (code.trim().length < 6) return;
    setBusy(true);
    try {
      await joinByCode(code);
      H.success();
      setJoinOpen(false);
      setCode("");
      await loadGroups();
    } catch {
      showAlert("Hata", "Kod geçersiz ya da grup bulunamadı.");
    }
    setBusy(false);
  };

  const doLeave = (g) => {
    H.warn();
    showAlert("Gruptan ayrıl", `${g.name} grubundan ayrılmak istiyor musun?`, [
      { text: "İptal", style: "cancel" },
      { text: "Ayrıl", style: "destructive", onPress: async () => {
        try {
          await leaveGroup(g.id, user.id);
          if (selected?.id === g.id) setSelected(null);
          loadGroups();
        } catch (e) { showAlert("Hata", e.message || "Gruptan ayrılınamadı."); }
      } },
    ]);
  };

  const shareCode = (g) => {
    Share.share({
      message: `Maraton'da "${g.name}" çalışma grubumuza katıl!\nKod: ${g.code}\n${appUrl(SCREENS.LEAGUE, { groupCode: g.code })}`,
    }).catch(() => {});
  };

  return {
    groups, loading, selected, setSelected, board, boardError, standing,
    createOpen, setCreateOpen, joinOpen, setJoinOpen,
    name, setName, code, setCode, busy,
    loadBoard, doCreate, doJoin, doLeave, shareCode,
  };
}
