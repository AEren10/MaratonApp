import { useState, useEffect, useCallback, useMemo } from "react";
import { Share } from "react-native";

import { createGroup, joinByCode, listMyGroups, leaveGroup, groupLeaderboard } from "../../supabase/groups";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";
import { appUrl } from "../../navigation/routes";
import { formatGroupJoinError } from "./groupErrors";

export function useGroupsController({ user, initialGroupCode }) {
  const showAlert = useAlert();
  const [groups, setGroups] = useState([]), [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null), [board, setBoard] = useState({ list: [] });
  const [boardError, setBoardError] = useState(null), [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false), [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState(""), [code, setCode] = useState(""), [codeError, setCodeError] = useState(null);

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
      .catch((err) => showAlert("Hata", formatGroupJoinError(err, initialGroupCode, groups)))
      .finally(() => setBusy(false));
  }, [initialGroupCode, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBoard = useCallback(async () => {
    if (!selected?.id || !user?.id) {
      setBoard({ list: [] });
      return;
    }
    setBoardError(null);
    setBoard({ list: [] });
    try {
      setBoard(await groupLeaderboard(selected.id, user.id));
    } catch (e) {
      setBoardError(e?.message || "Sıralama yüklenemedi.");
    }
  }, [selected?.id, user?.id]);
  useEffect(() => { loadBoard(); }, [loadBoard]);

  const standing = useMemo(() => {
    if (!board.list?.length) return null;
    const leader = board.list[0], mine = board.list.find((m) => m.you);
    if (!mine) return null;
    const isLeader = mine.rank === 1, second = board.list[1];
    const myQ = mine.weekly_questions ?? mine.questions ?? 0;
    const leaderQ = leader.weekly_questions ?? leader.questions ?? 0;
    const secondQ = second ? (second.weekly_questions ?? second.questions ?? 0) : 0;
    const diff = isLeader ? Math.max(0, myQ - secondQ) : Math.max(0, leaderQ - myQ);
    return { isLeader, rank: mine.rank, diff, leaderName: leader.name || "Lider", leaderQuestions: leaderQ };
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
    const clean = code.trim().toUpperCase();
    if (clean.length < 6) {
      H.warn();
      setCodeError("Lütfen 6 haneli kodu eksiksiz gir.");
      return;
    }
    if (groups.some((g) => (g.code || "").toUpperCase() === clean)) {
      H.warn();
      setCodeError("Bu gruba zaten üyesin.");
      return;
    }
    setBusy(true);
    setCodeError(null);
    try {
      await joinByCode(clean);
      H.success();
      closeJoin();
      setCode("");
      await loadGroups();
    } catch (err) {
      H.error();
      setCodeError(formatGroupJoinError(err, clean, groups));
    } finally {
      setBusy(false);
    }
  };

  const closeJoin = () => { setJoinOpen(false); setCodeError(null); };

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
    createOpen, setCreateOpen, joinOpen, setJoinOpen, closeJoin,
    name, setName, code, setCode: (v) => { setCode(v); if (codeError) setCodeError(null); },
    codeError, busy,
    loadBoard, doCreate, doJoin, doLeave, shareCode,
  };
}
