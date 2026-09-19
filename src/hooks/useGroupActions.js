import { useCallback, useState } from "react";

import {
  createGroup,
  deleteGroup as deleteGroupRecord,
  joinByCode,
  leaveGroup,
  removeGroupMember,
  regenerateGroupCode,
  updateGroupSettings,
} from "../supabase/groups";
import { captureError } from "../lib/errorReporting";
import * as H from "../lib/haptics";

export function useGroupActions({ onDone, showAlert } = {}) {
  const [busy, setBusy] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState(null);

  const run = useCallback(async (key, fn, successMessage) => {
    setBusy(true);
    setBusyKey(key);
    setError(null);
    try {
      const result = await fn();
      H.success();
      if (successMessage) showAlert?.("Tamam", successMessage);
      onDone?.(result, key);
      return result;
    } catch (e) {
      setError(e);
      captureError(e, { context: `group_action_${key}` });
      showAlert?.("Hata", e.message || "İşlem tamamlanamadı.");
      throw e;
    } finally {
      setBusy(false);
      setBusyKey(null);
    }
  }, [onDone, showAlert]);

  const create = useCallback((payload) => (
    run("create", () => createGroup(payload), "Grup oluşturuldu.")
  ), [run]);

  const join = useCallback((code) => (
    run("join", () => joinByCode(code), "Gruba katıldın.")
  ), [run]);

  const leave = useCallback((groupId) => (
    run("leave", () => leaveGroup(groupId), "Gruptan ayrıldın.")
  ), [run]);

  const removeMember = useCallback((groupId, userId) => (
    run(`remove:${userId}`, () => removeGroupMember(groupId, userId), "Üye çıkarıldı.")
  ), [run]);

  const regenerateCode = useCallback((groupId) => (
    run("regenerateCode", () => regenerateGroupCode(groupId), "Yeni kod oluşturuldu.")
  ), [run]);

  const regenerateCodeValue = useCallback(async (groupId) => {
    const result = await regenerateCode(groupId);
    return result?.code || result;
  }, [regenerateCode]);

  const updateSettings = useCallback((groupId, payload) => (
    run("updateSettings", () => updateGroupSettings(groupId, payload), "Grup güncellendi.")
  ), [run]);

  const updateName = useCallback((groupId, name) => (
    updateSettings(groupId, { name })
  ), [updateSettings]);

  const deleteGroup = useCallback((groupId) => (
    run("delete", () => deleteGroupRecord(groupId), "Grup silindi.")
  ), [run]);

  return {
    busy,
    busyKey,
    error,
    create,
    createGroup: create,
    join,
    joinGroupByCode: join,
    leave,
    leaveGroup: leave,
    removeMember,
    regenerateCode,
    regenerateGroupCode: regenerateCodeValue,
    updateSettings,
    updateGroupName: updateName,
    deleteGroup,
  };
}
