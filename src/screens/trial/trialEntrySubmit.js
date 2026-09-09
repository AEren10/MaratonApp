import { track } from "../../lib/analytics";
import { syncChallengeProgress } from "../../lib/challengeSync";
import { saveTrialOffline } from "../../lib/offlineQueue";
import { EVENTS } from "../../constants/analytics";
import { SCREENS } from "../../constants/screens";
import { buildTrialName, buildTrialSubjectScores } from "../../domain/trial/trialEntryModel";
import { getFieldFromType, getTrialTypes } from "../../domain/trial/trialTypes";
import { trialEntrySchema } from "../../validations/auth";
import { addTrial } from "../../store/slices/trialSlice";
import { formatDateISO } from "./trialEntryDates";
import * as H from "../../lib/haptics";
import { trialDifficultyMultiplier } from "../../domain/trial/trialModel";

export async function submitTrialEntry({
  C,
  branchSubject,
  checkFeature,
  bumpUsage,
  completeForm,
  dispatch,
  difficultyLevel,
  mood,
  navigation,
  reward,
  publisherId,
  setSaving,
  showAlert,
  showPaywall,
  subjects,
  title,
  totalNet,
  trialDate,
  trialType,
  user,
  values,
  wrongPenalty,
}) {
  if (!user?.id || user.id === "dev") {
    H.warn();
    showAlert("Oturum bulunamadı", "Deneme sonucunu kaydetmek için tekrar giriş yapmalısın.");
    return;
  }
  if (!checkFeature("unlimited_trials")) {
    H.warn();
    showPaywall("trial_entry_limit");
    return;
  }
  if (trialType === "BRANCH" && !branchSubject) {
    H.warn();
    showAlert("Ders seç", "Branş denemesi için bir ders seçmelisin.");
    return;
  }

  const { hasAny, solvedCount, subjectsArr, subjectsMap } = buildTrialSubjectScores(
    subjects,
    values,
    wrongPenalty,
  );
  if (!hasAny) {
    H.warn();
    showAlert("Boş deneme", "En az bir ders için değer gir.");
    return;
  }

  const netVal = parseFloat(totalNet);
  const trialName = buildTrialName({
    branchSubjectName: subjects[0]?.name,
    title,
    trialType,
    typeMeta: getTrialTypes(C)[trialType],
  });
  const trialDateISO = formatDateISO(trialDate);
  const field = getFieldFromType(trialType);

  const parsed = trialEntrySchema.safeParse({
    name: trialName,
    trial_date: trialDateISO,
    exam_type: trialType,
    total_net: netVal,
    subjects: subjectsArr,
  });
  if (!parsed.success) {
    H.warn();
    showAlert("Geçersiz veri", parsed.error.issues[0]?.message || "Lütfen verileri kontrol edin.");
    return;
  }

  const localTrial = {
    id: Date.now().toString(),
    date: trialDateISO,
    name: trialName,
    totalNet: netVal,
    subjects: subjectsMap,
    trialType,
    field,
    branchSubject,
    publisherId,
    difficultyLevel,
    difficultyMultiplier: trialDifficultyMultiplier(difficultyLevel),
    mood,
  };
  setSaving(true);
  let result;
  try {
    result = await saveTrialOffline(
      {
        user_id: user.id,
        name: trialName,
        trial_date: trialDateISO,
        exam_type: trialType,
        field,
        branch_subject: branchSubject,
        total_net: netVal,
        mood,
        publisher_id: publisherId,
        difficulty_level: difficultyLevel,
      },
      subjectsArr,
    );
  } catch (error) {
    setSaving(false);
    H.warn();
    if (error?.code === "quota_exhausted") {
      track(EVENTS.TRIAL_QUOTA_BLOCKED, { source: "server" });
      await bumpUsage?.("trial");
      showPaywall("trial_entry_limit");
    } else {
      showAlert("Kaydedilemedi", "Deneme sonucu güvenle saklanamadı. Bağlantını kontrol edip yeniden dene.");
    }
    return;
  }
  setSaving(false);
  dispatch(addTrial(result.data || localTrial));

  // Kota sayacını ANINDA artır. Yalnızca uygulama öne gelince tazelemek
  // yetmiyordu: art arda deneme giren kullanıcı ücretsiz sınırı aşabiliyordu.
  bumpUsage?.("trial");

  if (result.queued) {
    showAlert("Çevrimdışı", "Deneme sonucu bağlantı geldiğinde gönderilecek.");
  }
  if (solvedCount > 0) {
    syncChallengeProgress(user.id, { questions: solvedCount });
  }

  completeForm({ net: netVal, trialType });
  track(EVENTS.TRIAL_ENTERED, { net: netVal, trialType });
  track(EVENTS.TRIAL_NORMALIZED, {
    difficultyLevel,
    hasPublisher: !!publisherId,
    queued: result.queued,
  });
  reward("trial_entry", {
    statUpdates: [
      { type: "increment", key: "totalTrials" },
      { type: "max", key: "maxNet", value: netVal },
    ],
  });
  H.success();
  navigation.replace(SCREENS.TRIAL_SUMMARY, { trial: localTrial });
}
