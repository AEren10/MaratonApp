import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { getProfile, updateProfile } from "../supabase/profiles";
import { editProfileSchema } from "../validations/profile";
import { validate } from "../validations/auth";
import * as H from "../lib/haptics";

// Is mantigi: profil yukleme + kaydetme + "herkese acik" tercihi.
// Ekran dosyasi sadece bunu cagirir (AGENTS.md: is mantigi hook'ta yasar).
export function useEditProfileForm() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();

  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [targetDepartment, setTargetDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    getProfile(user.id)
      .then((p) => {
        if (p?.name) setName(p.name);
        if (p?.show_in_leaderboard != null) setShowInLeaderboard(!!p.show_in_leaderboard);
        if (p?.target_department) setTargetDepartment(p.target_department);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggleLeaderboard = useCallback((next) => {
    H.tap();
    setShowInLeaderboard(next);
  }, []);

  const save = useCallback(async () => {
    if (saving) return;
    const { ok, errors: fieldErrors, data } = validate(editProfileSchema, { name });
    if (!ok) {
      setErrors(fieldErrors);
      H.error();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name: data.name,
        show_in_leaderboard: showInLeaderboard,
      });
      H.success();
      navigation.goBack();
    } catch (e) {
      H.error();
      showAlert("Hata", e.message || "Profil güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }, [name, showInLeaderboard, user?.id, navigation, saving, showAlert]);

  return {
    name, setName,
    showInLeaderboard, toggleLeaderboard,
    targetDepartment,
    loading, saving, errors,
    save,
  };
}
