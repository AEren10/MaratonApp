import { memo } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../../../constants/screens";
import { TAB_KEYS } from "../../../navigation/tabAssignment";
import { openInTab } from "../../../navigation/tabJump";
import { useAuth } from "../../../contexts/AuthContext";
import { useExam } from "../../../contexts/ExamContext";
import { MONTHS } from "../../../domain/summary/summaryFormat";
import { examNetLabel } from "../../onboarding/useGoalSetupForm";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

const FIELD = { sayisal: "Sayısal", ea: "Eşit ağırlık", sozel: "Sözel", dil: "Dil" };

const dateText = (raw) => {
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : null;
};

// Profil duzenle ekraninin "kendi bilgilerin" kismi. Ekran yalniz ad ve
// hedef bolumden ibaretti; kullanici e-postasini, sinavini, uyelik tarihini
// hicbir yerde goremiyordu. Her satir kendi duzenleme ekranina gider.
export const EditProfileAccountSection = memo(function EditProfileAccountSection() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { examType, field, examDate } = useExam();
  // Profil duzenle KOK yiginda (sekmelerin ustunde). Hesap ekranlari da kokte,
  // ama Sinav tarihi ve Hedefler Profil sekmesinin yiginda; duz navigate
  // oraya inemez ("NAVIGATE not handled"), sekme uzerinden acilir.
  const go = (screen) => () => navigation.navigate(screen);
  const inProfile = (screen) => () => openInTab(navigation, TAB_KEYS.PROFIL, screen);

  const exam = examType ? examNetLabel(examType) : null;
  const examValue = exam && FIELD[field] && examType === "tyt_ayt" ? `${exam} · ${FIELD[field]}` : exam;
  const since = dateText(user?.created_at);

  return (
    <>
      <SettingsGroup title="HESAP">
        <SettingsRow first label="E-posta" value={user?.email || "—"} onPress={go(SCREENS.EDIT_EMAIL)} />
        <SettingsRow label="Şifre" value="••••••" onPress={go(SCREENS.CHANGE_PASSWORD)} />
        {since ? <SettingsRow label="Maraton'da" value={`${since}'ten beri`} disabled /> : null}
      </SettingsGroup>

      <SettingsGroup title="SINAV">
        <SettingsRow first label="Sınav" value={examValue || "Seçilmedi"} />
        <SettingsRow label="Sınav tarihi" value={dateText(examDate) || "Seçilmedi"} onPress={inProfile(SCREENS.EXAM_DATE)} />
        <SettingsRow label="Hedef netler" onPress={inProfile(SCREENS.GOALS)} />
      </SettingsGroup>
    </>
  );
});
