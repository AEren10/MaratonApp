import { useCallback, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button, Card } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useAccountDataCounts } from "../../hooks/useAccountDataCounts";
import * as H from "../../lib/haptics";
import { useSettingsActions } from "./useSettingsActions";
import { SystemHeader } from "./components/system/SystemHeader";
import { DeleteSummaryCard } from "./components/system/DeleteSummaryCard";
import { DeleteConfirmInput, isConfirmWord } from "./components/system/DeleteConfirmInput";

// Tasarim "Hesap Silme". Guvenli aksiyon birincil, yikici olan sessiz
// cercevede ve kutuya SİL yazilana kadar kapali. Silme useSettingsActions
// .deleteAccountNow (depolama temizligi basarisizsa auth silinmez).
// Tasarimdaki "30 gün içinde geri dönersen" cumlesi cizilmedi: silme
// aninda ve kalici (delete_own_account), geri donus penceresi yok.
export default function AccountDeleteScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { counts, loading } = useAccountDataCounts();
  const { deleteAccountNow } = useSettingsActions();
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const armed = isConfirmWord(typed);

  const close = useCallback(() => { H.tap(); navigation.goBack(); }, [navigation]);
  const confirm = useCallback(async () => {
    if (!armed || deleting) return;
    setDeleting(true);
    const ok = await deleteAccountNow();
    if (!ok) setDeleting(false);
  }, [armed, deleting, deleteAccountNow]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}
    >
      <SystemHeader icon="x" a11y="Kapat" onPress={close} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + STEP.s4 }]}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
          <Text accessibilityRole="header" style={[TYPOGRAPHY.heading, { color: C.text }]}>Bu geri alınamaz.</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(520).delay(140)}>
          <DeleteSummaryCard counts={counts} loading={loading} />
          <Card radius="panel" style={[styles.note, { borderColor: C.elev }]}>
            <View style={[styles.mark, { backgroundColor: C.down }]} />
            <Text style={[TYPOGRAPHY.caption, styles.flex, { color: C.text2 }]}>
              Premium aboneliğin varsa App Store üzerinden ayrıca iptal edilmeli.
            </Text>
          </Card>
          <DeleteConfirmInput value={typed} onChangeText={setTyped} editable={!deleting} />
        </Animated.View>

        <View style={styles.actions}>
          <Button variant="secondary" size="lg" fullWidth onPress={close} disabled={deleting} style={{ backgroundColor: C.elev }}>
            <Text style={[TYPOGRAPHY.button, { color: C.text }]}>Vazgeç, hesabım kalsın</Text>
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={confirm}
            disabled={!armed || deleting}
            loading={deleting}
            accessibilityHint="Kutuya SİL yazınca açılır"
            style={[styles.destructive, { borderColor: C.danger }]}
          >
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.danger }]}>Hesabı kalıcı olarak sil</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER },
  hero: { paddingTop: STEP.s4 - 2 },
  note: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 1, marginTop: STEP.s3 + 4 },
  mark: { width: 6, height: 6, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1 },
  actions: { paddingTop: STEP.s4 - 4, gap: STEP.s2 - 2 },
  destructive: { borderWidth: 1 },
});
