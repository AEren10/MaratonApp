import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, Card, EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { LEGAL_DOCS, readingMinutes } from "../../constants/legalDocs";

// Tasarimin "Belge" ekrani: BELGE etiketi + baslik + son guncelleme +
// okuma suresi + bolumler. Gizlilik ve Kullanim Sartlari ayni duzeni
// paylastigi icin tek ekran, `docKey` parametresiyle.
export default function DocumentScreen({ fallbackDocKey }) {
  const C = useC();
  const navigation = useNavigation();
  // fallbackDocKey: TermsScreen gibi sabit bir belgeye acilan ekranlar
  // parametre gecmeden bu bileseni kullanabiliyor.
  const docKey = useRoute().params?.docKey || fallbackDocKey;
  const doc = LEGAL_DOCS[docKey] || null;

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, flex: 1 }]}>BELGE</Text>
      </View>

      {!doc ? (
        <EmptyState
          title="Belge bulunamadı."
          body="Bu belge henüz yayınlanmadı."
          style={styles.empty}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{doc.title}</Text>
          <Text style={[TYPOGRAPHY.meta, styles.meta, { color: C.text3 }]}>
            {`Son güncelleme ${doc.lastUpdated} · ${readingMinutes(doc)} dk okuma`}
          </Text>

          {doc.sections.map((sec) => (
            <View key={sec.title} style={styles.section}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{sec.title}</Text>
              <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{sec.body}</Text>
            </View>
          ))}

          <Card tone="surface" radius="panel" style={styles.note}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
              Ayarlar · Gizlilik ekranından verilerinin kopyasını indirebilir, hesabını
              silebilirsin. Talebin için mail atmana gerek yok.
            </Text>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: 60 },
  empty: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center" },
  meta: { marginTop: STEP.s1 },
  section: { marginTop: STEP.s4 },
  body: { marginTop: STEP.s1, lineHeight: 23 },
  note: { marginTop: STEP.s5 },
});
