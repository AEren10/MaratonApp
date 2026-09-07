import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { usePendingWrites } from "../../hooks/usePendingWrites";
import { flushQueue, retryDeadLetter } from "../../lib/offlineQueue";
import * as H from "../../lib/haptics";

// Kalıcı olarak gönderilemeyen kayıt varsa ana ekranda uyarı şeridi.
// Ayarlardaki satır yeterli değil: kullanıcı ayarlara girmezse veri kaybını
// hiç fark etmiyor. Yalnızca failed > 0 iken görünür — bekleyen kayıt
// (normal çevrimdışı durum) için uyarı çıkarmıyoruz.

export function SyncProblemBanner() {
  const C = useC();
  const navigation = useNavigation();
  const { failed, refresh } = usePendingWrites();
  const [busy, setBusy] = useState(false);
  const styles = useMemo(() => makeStyles(C), [C]);

  const retry = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    H.tap();
    try {
      await retryDeadLetter();
      await flushQueue();
      await refresh();
    } catch (_) {
    } finally {
      setBusy(false);
    }
  }, [busy, refresh]);

  if (!failed) return null;

  return (
    <View style={styles.wrap}>
      <Icon name="alert" size={18} color={C.red} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{failed} kayıt gönderilemedi</Text>
        <Text style={styles.sub}>Cihazında duruyor. Tekrar denemek için dokun.</Text>
      </View>
      <Pressable onPress={retry} hitSlop={8} style={styles.action}>
        <Text style={styles.actionText}>{busy ? "..." : "Tekrar dene"}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate(SCREENS.SETTINGS)} hitSlop={8}>
        <Icon name="chevR" size={16} color={C.muted} />
      </Pressable>
    </View>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginTop: SPACING.lg,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      backgroundColor: C.red + "12",
      borderWidth: 1,
      borderColor: C.red + "30",
    },
    title: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    sub: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.xs / 2 },
    action: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs + 2,
      borderRadius: RADIUS.md,
      backgroundColor: C.red + "20",
    },
    actionText: { ...TYPOGRAPHY.caption, color: C.red, fontWeight: "600" },
  });
