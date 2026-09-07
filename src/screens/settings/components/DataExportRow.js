import { useCallback, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useAlert } from "../../../contexts/AlertContext";
import { collectUserData, summarizeExport, deliverExport } from "../../../supabase/dataExport";
import * as H from "../../../lib/haptics";

// VERİLERİMİ İNDİR
//
// dataExport.js yazılmıştı ama HİÇBİR EKRAN çağırmıyordu: KVKK/GDPR'ın
// verdiği veri taşınabilirliği hakkı kod olarak vardı, kullanıcı için yoktu.
// Gizlilik ekranının altına bağlandı.

export function DataExportRow() {
  const C = useC();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const run = useCallback(async () => {
    if (busy || !user?.id) return;
    setBusy(true);
    H.tap();
    try {
      const result = await collectUserData(user.id, (done, total, label) => {
        setProgress({ done, total, label });
      });
      if (!result) throw new Error("Veri toplanamadı");

      const summary = summarizeExport(result.export);
      const delivered = await deliverExport(result.export);

      if (!delivered?.ok) {
        showAlert("Paylaşılamadı", "Dosya oluşturuldu ama paylaşım açılamadı.");
      } else if (result.errors?.length) {
        // Eksik tabloyu SESSİZCE geçmiyoruz — "tüm verilerin" dosyası eksikse
        // kullanıcı bunu bilmeli.
        showAlert(
          "Verilerin indirildi",
          `${summary} Ancak ${result.errors.length} bölüm alınamadı; dosyada not düşüldü.`,
        );
      }
    } catch (e) {
      H.error();
      showAlert("İndirilemedi", e?.message || "Verilerin alınamadı, tekrar dene.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [busy, user?.id, showAlert]);

  const styles = makeStyles(C);

  return (
    <Pressable
      onPress={run}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="Verilerimi indir"
      accessibilityState={{ disabled: busy, busy }}
      style={({ pressed }) => [styles.wrap, { opacity: pressed || busy ? 0.7 : 1 }]}
    >
      {busy ? <ActivityIndicator color={C.accent} /> : <Icon name="share" size={20} color={C.accent} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Verilerimi indir</Text>
        <Text style={styles.sub}>
          {busy
            ? progress
              ? `${progress.label} (${progress.done}/${progress.total})`
              : "Hazırlanıyor…"
            : "Uygulamadaki tüm kişisel verini JSON olarak al"}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      marginTop: SPACING.xl,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      minHeight: 56,
    },
    title: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    sub: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.xs / 2 },
  });
