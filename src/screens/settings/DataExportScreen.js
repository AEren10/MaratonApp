import { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button, ErrorState } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../themes/tokens";
import { useAccountDataCounts } from "../../hooks/useAccountDataCounts";
import { useDataExport } from "../../hooks/useDataExport";
import * as H from "../../lib/haptics";
import { SystemHeader } from "./components/system/SystemHeader";
import { DataContentsCard } from "./components/system/DataContentsCard";
import { Press } from "../../components/design/Press";

// Tasarim "Veri İndir". Disa aktarma mantigi useDataExport'ta (JSON, paylasim
// sayfasi); tasarimin CSV/JSON secimi ve e-posta teslimi uygulamada yok, o
// yuzden o iki blok cizilmedi.
export default function DataExportScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { counts, loading, error, reload } = useAccountDataCounts();
  const { run, busy, progress } = useDataExport();

  const goBack = useCallback(() => { H.tap(); navigation.goBack(); }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <SystemHeader label="VERİ İNDİR" onPress={goBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + STEP.s4 }]}
      >
        <Animated.View style={styles.hero}>
          <Text accessibilityRole="header" style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>
            Verilerinin kopyası
          </Text>
          <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text3 }]}>
            Hesabındaki her kayıt tek dosyada. Uygulamada hiçbir şey silinmez.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(520).delay(140)} style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>İÇİNDE NE VAR</Text>
          {error ? (
            <ErrorState preset="server" onPrimary={reload} style={styles.error} />
          ) : (
            <DataContentsCard counts={counts} loading={loading} />
          )}
        </Animated.View>

        <View style={styles.actions}>
          <Button onPress={run} size="lg" fullWidth loading={busy} disabled={busy}>
            Verilerimi indir
          </Button>
          {busy && progress ? (
            <Text style={[TYPOGRAPHY.meta, styles.progress, { color: C.text3 }]}>
              {`${progress.label} (${progress.done}/${progress.total})`}
            </Text>
          ) : null}
          <Press haptic="none" onPress={goBack} accessibilityRole="button" style={styles.secondary}>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Vazgeç</Text>
          </Press>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER },
  hero: { paddingTop: STEP.s4 - 2 },
  title: { maxWidth: 300 },
  body: { marginTop: STEP.s2 + 2, maxWidth: 306 },
  section: { paddingTop: STEP.s3 + 8 },
  error: { marginTop: STEP.s2 },
  actions: { paddingTop: STEP.s3 + 6 },
  progress: { marginTop: STEP.s1, textAlign: "center" },
  secondary: { height: CONTROL.tapMin + 4, marginTop: STEP.s1 + 2, alignItems: "center", justifyContent: "center" },
});
