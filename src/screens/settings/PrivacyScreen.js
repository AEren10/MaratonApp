import { useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const LAST_UPDATED = "18 Haziran 2026";

const SECTIONS = [
  {
    title: "Veri Toplama",
    body: "Maraton, hizmetlerini sunabilmek için ad, e-posta adresi ve çalışma verilerinizi toplar. Bu veriler yalnızca uygulamanın işlevselliğini sağlamak amacıyla kullanılır.",
  },
  {
    title: "Veri Kullanımı",
    body: "Toplanan veriler, kişiselleştirilmiş çalışma planları oluşturmak, ilerlemenizi takip etmek ve istatistiklerinizi göstermek için kullanılır. Verileriniz üçüncü taraflarla paylaşılmaz.",
  },
  {
    title: "Üçüncü Taraf Hizmetleri",
    body: "Uygulama altyapısı Supabase (veritabanı ve kimlik doğrulama), Sentry (hata takibi) ve Expo (uygulama güncellemeleri) hizmetlerini kullanmaktadır. Bu hizmetler yalnızca teknik altyapı amacıyla veri işler.",
  },
  {
    title: "Veri Güvenliği",
    body: "Tüm veriler şifrelenmiş bağlantı (TLS) üzerinden iletilir ve güvenli sunucularda saklanır. Erişim kontrolleri, satır düzeyinde güvenlik (RLS) ve düzenli güvenlik denetimleri uygulanmaktadır.",
  },
  {
    title: "Veri Saklama Süresi",
    body: "Kişisel verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir.",
  },
  {
    title: "Yaş Sınırı",
    body: "Maraton, 13 yaş ve üzeri kullanıcılar için tasarlanmıştır. 13 yaşından küçük bireylerin kişisel verilerini bilerek toplamıyoruz.",
  },
  {
    title: "Haklarınız",
    body: "Verilerinize erişim talep edebilir, düzeltme isteyebilir veya Ayarlar ekranından hesabınızı silebilirsiniz. Talepleriniz 30 gün içerisinde işleme alınır.",
  },
  {
    title: "İletişim",
    body: "Gizlilik politikamızla ilgili sorularınız için destek@maraton.app adresine e-posta gönderebilirsiniz.",
  },
];

export default function PrivacyScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Gizlilik Politikası</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.updated}>Son güncelleme: {LAST_UPDATED}</Text>
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

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 60 },
    updated: { ...TYPOGRAPHY.caption, color: C.muted, marginBottom: SPACING.xl },
    section: { marginBottom: SPACING.xxl },
    sectionTitle: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: SPACING.sm },
    sectionBody: { ...TYPOGRAPHY.body, color: C.sec },
  });
}
