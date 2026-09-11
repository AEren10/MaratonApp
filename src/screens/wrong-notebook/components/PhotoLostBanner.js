import { View, Text, StyleSheet } from "react-native";

import { Button, Icon } from "../../../components/design";
import { STEP, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";

// Bilinen açık: OS önbelleği temizlenince kuyruktaki fotoğraf gönderilemeyip
// dead-letter'a düşer, soru metni kalır ama fotoğraf sessizce kaybolur.
// Bu bandı gösterip kullanıcıya seçenek sunuyoruz — sessiz kayıp yok.
export function PhotoLostBanner({ C, count, onRetry }) {
  if (!count) return null;
  return (
    <View style={[styles.wrap, { backgroundColor: C.warn + "14", borderColor: C.warn + "40" }]}>
      <Icon name="alert" size={18} color={C.warn} />
      <Text style={[TYPOGRAPHY.caption, styles.text, { color: C.text }]}>
        {count === 1
          ? "1 sorunun fotoğrafı yüklenemedi. Soru metni kaldı, fotoğrafı tekrar eklemen gerekebilir."
          : `${count} sorunun fotoğrafı yüklenemedi. Soru metinleri kaldı, fotoğrafları tekrar eklemen gerekebilir.`}
      </Text>
      <Button size="sm" variant="outline" onPress={onRetry} accessibilityLabel="Yüklemeyi tekrar dene">
        Tekrar dene
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s1,
    borderWidth: 1,
    borderRadius: SHAPE.cardTight,
    padding: STEP.s2,
    marginHorizontal: STEP.s3,
    marginBottom: STEP.s1,
  },
  text: { flex: 1 },
});
