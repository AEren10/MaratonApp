import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { stopLogOperationIds } from "../domain/plan/stopStudyLog";
import { getStudyLogByClientOperationId } from "../supabase/studyLogs";

function amountText(stop) {
  const q = Number(stop?.count) || 0;
  const m = Number(stop?.minutes) || 0;
  return [q > 0 ? `${q} soru` : null, m > 0 ? `${m} dk` : null].filter(Boolean).join(" · ");
}

// Bitmis durakta iki is: tiki geri almak (yanlislikla tiklendiyse) ve
// tikle yazilan kaydi duzeltmek (planlanandan fazla/az calistiysa).
// Ana sayfa ve "Programin tamami" ayni metni ve ayni ekrani kullanir.
export function useStopRecordActions() {
  const navigation = useNavigation();
  const showAlert = useAlert();
  const { user } = useAuth();

  const confirmUndo = useCallback((stop, onConfirm) => {
    const amount = amountText(stop);
    showAlert(
      "Tiki geri al?",
      amount
        ? `Bu durak için yazılan ${amount} silinir, durak yeniden açılır.`
        : "Durak yeniden açılır.",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Geri al", onPress: onConfirm },
      ],
    );
  }, [showAlert]);

  const undoFailed = useCallback(() => {
    showAlert("Geri alınamadı", "Yalnız bugün bitirdiğin durak geri açılır. Bağlantını kontrol edip yeniden dene.");
  }, [showAlert]);

  const openEdit = useCallback(async (stop) => {
    if (!user?.id || user.id === "dev") return;
    let log = null;
    for (const id of stopLogOperationIds(stop)) {
      log = await getStudyLogByClientOperationId(user.id, id).catch(() => null);
      if (log) break;
    }
    if (log) {
      navigation.navigate(SCREENS.EDIT_STUDY_LOG, { log });
      return;
    }
    showAlert("Kayıt henüz yok", "Bu durağın kaydı daha sunucuya ulaşmadı. Biraz sonra yeniden dene.");
  }, [navigation, showAlert, user?.id]);

  return { confirmUndo, undoFailed, openEdit };
}
