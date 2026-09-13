import { useNavigation } from "@react-navigation/native";
import { useExam } from "../../../contexts/ExamContext";
import { getExamPhase } from "../../../domain/exam/examPhase";
import { useExamResultEntry } from "../../../hooks/useExamResultEntry";
import { SCREENS } from "../../../constants/screens";
import { ProfileLinkRow } from "./ProfileLinkRow";

// Sinav akisinin Profil girisi (AKIS 14). Sinava 30 gun ve daha az kala
// "Sınav günü planı"; sinav gectikten sonra sonuc yoksa "Sınav sonucu",
// varsa "Tahmin ne kadar tuttu". Metinler tasarimin satir/akis etiketleri.
export function ExamFlowRow() {
  const navigation = useNavigation();
  const { examDate } = useExam();
  const { entry, status } = useExamResultEntry();
  const { daysLeft } = getExamPhase(examDate);

  if (daysLeft == null) return null;

  if (daysLeft >= 0 && daysLeft <= 30) {
    return (
      <ProfileLinkRow
        label="Sınav günü planı"
        meta="Saat, çanta, yol"
        onPress={() => navigation.navigate(SCREENS.EXAM_DAY_PLAN)}
      />
    );
  }

  if (daysLeft < 0 && status !== "loading") {
    return entry ? (
      <ProfileLinkRow label="Tahmin ne kadar tuttu" onPress={() => navigation.navigate(SCREENS.FORECAST_ACCURACY)} />
    ) : (
      <ProfileLinkRow label="Sınav sonucu" onPress={() => navigation.navigate(SCREENS.EXAM_RESULT)} />
    );
  }

  return null;
}
