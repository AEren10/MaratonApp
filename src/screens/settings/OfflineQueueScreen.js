import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Skeleton } from "../../components/design";
import { OfflineStrip } from "../../components/common/OfflineStrip";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../themes/tokens";
import { useOfflineQueueView } from "../../hooks/useOfflineQueueView";
import * as H from "../../lib/haptics";
import { SystemHeader } from "./components/system/SystemHeader";
import { QueueRow } from "./components/system/QueueRow";
import { FailedRow } from "./components/system/FailedRow";

// Tasarim "Çevrimdışı Kuyruk". Engelleyici degil: serit ustte, kuyruktaki
// her kayit adiyla, guncellenmeyen veri ayrica yazili.
export default function OfflineQueueScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    rows, total, failedRows, loading, retrying, retryNow, discard, isConnected,
  } = useOfflineQueueView();

  const goBack = useCallback(() => { H.tap(); navigation.goBack(); }, [navigation]);
  const renderItem = useCallback(({ item }) => <QueueRow title={item.title} meta={item.meta} />, []);
  const keyExtractor = useCallback((item) => String(item.id), []);

  const header = (
    <Animated.View entering={FadeInDown.duration(600)}>
      {!isConnected ? <OfflineStrip pending={total} style={styles.strip} /> : null}
      <Text accessibilityRole="header" style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>
        {failedRows.length ? "Birkaç kayıt sunucuya ulaşamadı." : "Çalışmaya devam edebilirsin."}
      </Text>
      <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>
        {failedRows.length
          ? "Hiçbiri kaybolmadı, hepsi cihazında duruyor. Tekrar deneyebilir ya da vazgeçtiklerini silebilirsin."
          : "Girdiğin her şey cihazında tutuluyor. Rota, bağlantı geldiğinde bir kerede yeniden çizilir."}
      </Text>

      {/* Gonderilemeyenler EN USTE: kullanici buraya ana ekrandaki kirmizi
          seritten geliyor ve aradigi sey bu. Bekleyenler normal durum. */}
      {failedRows.length ? (
        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text2 }]}>GÖNDERİLEMEYEN</Text>
          <Text style={[TYPOGRAPHY.meta, styles.failedNote, { color: C.text3 }]}>
            Bu kayıtlar cihazında duruyor ama sunucuya yazılamadı. Aşağıdaki
            düğme hepsini yeniden dener; vazgeçtiklerini tek tek silebilirsin.
          </Text>
          {failedRows.map((row) => (
            <FailedRow
              key={row.id}
              title={row.title}
              meta={row.meta}
              onDiscard={() => discard(row.id)}
            />
          ))}
        </View>
      ) : null}
      {loading ? <Skeleton height={48} style={styles.section} /> : null}
      {rows.length ? <Text style={[TYPOGRAPHY.label, styles.section, styles.label, { color: C.text2 }]}>KUYRUKTA</Text> : null}
    </Animated.View>
  );

  const footer = !isConnected ? (
    <View style={[styles.note, { backgroundColor: C.void, borderColor: C.border }]}>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
        Tahmin ve tempo senaryoları çevrimdışıyken güncellenmez — son hesaplanan değerleri görüyorsun.
      </Text>
    </View>
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <SystemHeader onPress={goBack} />
      <FlatList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={[styles.list, { paddingBottom: STEP.s5 + STEP.s4 }]}
        showsVerticalScrollIndicator={false}
      />
      {rows.length || failedRows.length ? (
        <View style={[styles.cta, { paddingBottom: insets.bottom + STEP.s2, backgroundColor: C.bg, borderTopColor: C.line }]}>
          <Button variant="outline" size="md" fullWidth loading={retrying} onPress={retryNow}>
            Şimdi yüklemeyi dene
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: GUTTER },
  strip: { marginTop: STEP.s1, marginHorizontal: -(STEP.s1 - 2) },
  title: { marginTop: STEP.s3 + 4, maxWidth: 290 },
  body: { marginTop: STEP.s2, maxWidth: 290 },
  section: { marginTop: STEP.s3 + 8 },
  label: { marginBottom: STEP.s2 },
  failedNote: { marginBottom: STEP.s2, maxWidth: 300 },
  note: {
    marginTop: STEP.s3 + 6,
    paddingVertical: STEP.s3 - 4,
    paddingHorizontal: STEP.s3 - 2,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 + 2, borderTopWidth: 1, minHeight: CONTROL.tapMin },
});
