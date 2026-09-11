import { useCallback, useState } from "react";
import { View, Text } from "react-native";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { usePendingWrites } from "../../../hooks/usePendingWrites";
import { flushQueue, retryDeadLetter, clearDeadLetter } from "../../../lib/offlineQueue";
import { useAlert } from "../../../contexts/AlertContext";
import * as H from "../../../lib/haptics";

import { SettingsGroup } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

// SENKRON DURUMU
//
// Neden var: offline kuyruk tamamen sessizdi. Kalıcı hataya düşen bir kayıt
// dead-letter'a gidiyor ve kullanıcı bunu ASLA öğrenmiyordu — "kaydedildi"
// deyip veriyi kaybediyorduk. Bu grup yalnızca gerçekten bekleyen ya da
// başarısız kayıt varsa görünür; her şey yolundaysa ayarlar sayfasını
// kalabalıklaştırmaz.

export function SyncStatusGroup() {
  const C = useC();
  const showAlert = useAlert();
  const { pending, failed, refresh } = usePendingWrites();
  const [busy, setBusy] = useState(false);

  const retry = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    H.tap();
    try {
      await retryDeadLetter();
      const result = await flushQueue();
      await refresh();
      if (result.processed > 0) {
        showAlert("Gönderildi", `${result.processed} kayıt sunucuya iletildi.`);
      } else {
        showAlert(
          "Gönderilemedi",
          "Kayıtlar hâlâ bekliyor. Bağlantını kontrol edip tekrar dene.",
        );
      }
    } catch (_) {
      showAlert("Gönderilemedi", "Şu an bağlantı kurulamadı.");
    } finally {
      setBusy(false);
    }
  }, [busy, refresh, showAlert]);

  const discard = useCallback(() => {
    H.warn();
    showAlert(
      "Başarısız Kayıtları Sil",
      `${failed} kayıt kalıcı olarak silinecek. Bu geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => { await clearDeadLetter(); refresh(); },
        },
      ],
    );
  }, [failed, refresh, showAlert]);

  if (!pending && !failed) return null;

  return (
    <SettingsGroup title="SENKRON">
      {pending > 0 && (
        <SettingsRow
          icon="clock"
          iconColor={C.amber}
          label={`${pending} kayıt gönderilmeyi bekliyor`}
          onPress={retry}
        />
      )}
      {failed > 0 && (
        <>
          <SettingsRow
            icon="alert"
            iconColor={C.red}
            label={`${failed} kayıt gönderilemedi — tekrar dene`}
            onPress={retry}
          />
          <SettingsRow
            icon="x"
            iconColor={C.muted}
            label="Başarısız kayıtları sil"
            onPress={discard}
          />
        </>
      )}
      <View style={{ paddingHorizontal: STEP.s3, paddingBottom: STEP.s2 }}>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>
          {failed > 0
            ? "Bu kayıtlar sunucuya iletilemedi. Silmediğin sürece cihazında duruyor."
            : "Bağlantı geldiğinde otomatik gönderilecek."}
        </Text>
      </View>
    </SettingsGroup>
  );
}
