import { useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

const SECTIONS = [
  {
    title: "Veri Toplama",
    body: "Maraton, hizmetlerini sunabilmek icin ad, e-posta adresi ve calisma verilerinizi toplar. Bu veriler yalnizca uygulamanin islevselligini saglamak amaciyla kullanilir.",
  },
  {
    title: "Veri Kullanimi",
    body: "Toplanan veriler, kisisellestirilmis calisma planlari olusturmak, ilerlemenizi takip etmek ve istatistiklerinizi gostermek icin kullanilir. Verileriniz ucuncu taraflarla paylasılmaz.",
  },
  {
    title: "Veri Guvenligi",
    body: "Tum veriler sifrelenmis baglanti uzerinden iletilir ve guvenli sunucularda saklanir. Erisim kontrolleri ve duzenli guvenlik denetimleri uygulanmaktadir.",
  },
  {
    title: "Haklariniz",
    body: "Verilerinize erisim talep edebilir, duzeltme isteyebilir veya hesabinizi sildirebilirsiniz. Talepleriniz 30 gun icerisinde isleme alinir.",
  },
  {
    title: "Iletisim",
    body: "Gizlilik politikamizla ilgili sorulariniz icin destek@maraton.app adresine e-posta gonderebilirsiniz.",
  },
];

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Gizlilik Politikasi</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 60 },
  section: { marginBottom: SPACING.xxl },
  sectionTitle: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: SPACING.sm },
  sectionBody: { ...TYPOGRAPHY.body, color: C.sec },
});
