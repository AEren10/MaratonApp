import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { usePremium } from "../contexts/PremiumContext";
import { useCurriculum } from "./useCurriculum";
import { useGamification } from "./useGamification";
import { uploadWrongQuestionImage } from "../supabase/storage";
import { saveWrongQuestionOffline } from "../lib/offlineQueue";
import { initialReview } from "../lib/spacedRepetition";
import { trackButtonTap } from "../lib/analytics";
import { getSubjectByKey } from "../themes/subjects";
import * as H from "../lib/haptics";

const PICK_OPTS = { mediaTypes: ["images"], quality: 0.7, allowsEditing: true };

function topicNames(subject) {
  const raw = subject?.topics || getSubjectByKey(subject?.key)?.topics || [];
  return raw.map((t) => (typeof t === "string" ? t : t.name));
}

// Yanlis Ekle formunun durumu ve kaydi. Ekran yalniz cizer.
export function useAddWrong({ initialSubjectKey, onSaved } = {}) {
  const { user } = useAuth();
  const showAlert = useAlert();
  const { checkFeature, showPaywall, bumpUsage } = usePremium();
  const { reward, xpToast, dismissXP } = useGamification();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const todayLogs = useSelector((state) => state.studyLog.todayLogs);

  const initialGroup = aytSubjects.some((s) => s.key === initialSubjectKey) ? 1 : 0;
  const [group, setGroup] = useState(initialGroup);
  const [subjectKey, setSubjectKey] = useState(initialSubjectKey || null);
  const [topic, setTopic] = useState(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const subjects = group === 0 ? tytSubjects : aytSubjects;
  const subject = subjects.find((s) => s.key === subjectKey) || subjects.find((s) => s.key === "matematik") || subjects[0] || null;

  // "son çalıştığından tahmin edildi": bugunku calisma kayitlarinda bu derse
  // ait en son konu. Kayit yoksa tahmin yok -- uydurulmaz.
  const guess = useMemo(() => {
    if (!subject) return null;
    const log = [...(todayLogs || [])].reverse().find((l) => l.subject === subject.key && l.topic);
    return log?.topic || null;
  }, [todayLogs, subject]);

  const selectedTopic = topic ?? guess;
  const suggestions = useMemo(() => {
    const names = topicNames(subject).filter((n) => n !== guess && n !== topic).slice(0, 4);
    return [guess, topic && topic !== guess ? topic : null, ...names].filter(Boolean);
  }, [subject, guess, topic]);

  const changeGroup = useCallback((next) => {
    setGroup(next);
    setSubjectKey(null);
    setTopic(null);
  }, []);
  const changeSubject = useCallback((key) => {
    H.select();
    setSubjectKey(key);
    setTopic(null);
  }, []);

  const pick = useCallback(async (source) => {
    const camera = source === "camera";
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert("İzin gerekli", camera ? "Kamera kullanmak için izin ver." : "Galeriden foto seçmek için izin ver.");
      return;
    }
    const res = camera ? await ImagePicker.launchCameraAsync(PICK_OPTS) : await ImagePicker.launchImageLibraryAsync(PICK_OPTS);
    if (!res.canceled && res.assets?.length) {
      H.select();
      setImage(res.assets[0].uri);
    }
  }, [showAlert]);

  const resetForNext = useCallback(() => {
    setImage(null);
    setNote("");
    setTopic(null);
  }, []);

  const save = useCallback(async (opts = {}) => {
    const keepOpen = opts?.keepOpen ?? false;
    if (saving) return;
    if (!checkFeature("unlimited_wrongs")) {
      H.warn();
      showPaywall("wrong_entry_limit");
      return;
    }
    if (!subject || !selectedTopic?.trim()) {
      H.error();
      showAlert("Konu eksik", "Hangi konuda yanlış yaptın?");
      return;
    }
    setSaving(true);
    try {
      let imagePath = null;
      let imageLocalUri = null;
      if (image) {
        try {
          imagePath = await uploadWrongQuestionImage(user.id, image);
        } catch {
          imageLocalUri = image;
        }
      }
      const name = selectedTopic.trim();
      const result = await saveWrongQuestionOffline({
        user_id: user.id,
        subject: subject.key,
        topic: name,
        my_answer: null,
        correct_answer: null,
        note: note.trim() || null,
        image_path: imagePath,
        ...(imageLocalUri ? { image_local_uri: imageLocalUri } : {}),
        topic_source: topicNames(subject).includes(name) ? "curriculum" : "custom",
        is_resolved: false,
        ...initialReview(),
      });
      bumpUsage?.("wrong");
      trackButtonTap("wrong_add_save", { subject: subject.key, hasImage: !!image, guessed: !topic && !!guess, keepOpen });
      if (result.queued || imageLocalUri) {
        H.tap();
        showAlert(imageLocalUri ? "Fotoğraf beklemede" : "Çevrimdışı", "Bağlantı geldiğinde otomatik kaydedilecek.");
      } else {
        H.success();
      }
      await reward("question_solved", { count: 1, statUpdates: [{ type: "increment", key: "totalQuestions" }] });
      if (keepOpen) {
        resetForNext();
      } else {
        onSaved?.();
      }
    } catch (err) {
      H.error();
      showAlert("Hata", "Kaydederken bir sorun oluştu.\n" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }, [saving, checkFeature, showPaywall, subject, selectedTopic, showAlert, image, user?.id, note, bumpUsage, topic, guess, reward, onSaved, resetForNext]);

  const saveAndNew = useCallback(() => save({ keepOpen: true }), [save]);

  return {
    changeGroup, changeSubject, dismissXP, group, groupLabels: [group1Label, group2Label],
    guess, image, note, pick, resetForNext, save, saveAndNew, saving, selectedTopic,
    setNote, setTopic, subject, subjects, suggestions, xpToast,
  };
}
