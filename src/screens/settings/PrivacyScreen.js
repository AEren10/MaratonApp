import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { LEGAL_DOCS } from "../../constants/legalDocs";
import { SettingsGroup } from "./components/SettingsGroup";
import { SettingsRow } from "./components/SettingsRow";
import { DataExportRow } from "./components/DataExportRow";
import { useSettingsActions } from "./useSettingsActions";

// Tasarimin "Gizlilik" ekrani bir HUB: belge satirlari + VERILERIN grubu.
// Politika METNI artik burada degil, "Belge" ekraninda (DocumentScreen);
// icerik src/constants/legalDocs.js icinde tek kaynakta.
export default function PrivacyScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { handleDeleteAccount } = useSettingsActions();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openDoc = useCallback(
    (docKey) => () => navigation.navigate(SCREENS.DOCUMENT, { docKey }),
    [navigation],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>
          Gizlilik ve şartlar
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tasarim ucuncu bir satir daha gosteriyor: "KVKK aydinlatma metni".
            Icerik saglanmadan cizilmiyor -- yasal metin uydurulamaz ve bos
            bir belge yayin riski olurdu. legalDocs.js'e eklendigi an burada
            kendiliginden gorunecek. */}
        <SettingsGroup>
          <SettingsRow
            first
            label={LEGAL_DOCS.privacy.title}
            hint={`Son güncelleme ${LEGAL_DOCS.privacy.lastUpdated}`}
            onPress={openDoc("privacy")}
          />
          <SettingsRow
            label={LEGAL_DOCS.terms.title}
            hint={`Son güncelleme ${LEGAL_DOCS.terms.lastUpdated}`}
            onPress={openDoc("terms")}
          />
        </SettingsGroup>

        <SettingsGroup title="VERİLERİN">
          <SettingsRow first label="Hesabımı sil" danger onPress={handleDeleteAccount} />
        </SettingsGroup>

        {/* Veri indirme kendi ilerleme/hata halini tasiyor. */}
        <View style={styles.exportWrap}>
          <DataExportRow />
        </View>

        <Card tone="surface" radius="panel" style={styles.note}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
            Rota verisi hesabında sunucuda tutulur. Telefon değişse de 362 günlük
            kaydın kaybolmaz.
          </Text>
        </Card>
      </ScrollView>
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
  scroll: { paddingBottom: 60 },
  exportWrap: { paddingHorizontal: GUTTER, marginTop: STEP.s3 },
  note: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
});
