import { useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const LAST_UPDATED = "20 Haziran 2026";

const SECTIONS = [
  {
    title: "1. Kabul ve Kapsam",
    body: "Maraton uygulamasını kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Bu koşullar, uygulamanın tüm özellik ve hizmetlerini kapsar. Uygulamayı kullanmak için 13 yaş ve üzeri olmanız gerekmektedir.",
  },
  {
    title: "2. Hesap ve Güvenlik",
    body: "Hesabınızı oluştururken doğru bilgiler vermeniz gerekmektedir. Hesap güvenliğinizden siz sorumlusunuz. Şifrenizi başkalarıyla paylaşmamanız ve hesabınızdaki yetkisiz erişimi derhal bildirmeniz beklenir.",
  },
  {
    title: "3. Kullanım Kuralları",
    body: "Uygulamayı yalnızca kişisel eğitim amaçlı kullanabilirsiniz. İçerikleri kopyalamak, dağıtmak, ters mühendislik yapmak veya ticari amaçla kullanmak yasaktır. Diğer kullanıcılara zarar verecek, yanıltıcı veya uygunsuz davranışlarda bulunmak yasaktır.",
  },
  {
    title: "4. İçerik ve Fikri Mülkiyet",
    body: "Uygulama içeriği, tasarım, logo ve yazılım Maraton'a aittir ve telif hakları ile korunmaktadır. Çalışma verileriniz ve oluşturduğunuz içerikler size aittir; ancak hizmeti sunabilmek için bu verileri işlememize izin vermiş sayılırsınız.",
  },
  {
    title: "5. Hizmet Sürekliliği",
    body: "Uygulamanın kesintisiz çalışacağını garanti etmiyoruz. Bakım, güncelleme veya teknik sorunlar nedeniyle hizmet geçici olarak kesintiye uğrayabilir. Önceden bildirim yapılmadan uygulama özellikleri değiştirilebilir veya kaldırılabilir.",
  },
  {
    title: "6. Sorumluluk Sınırı",
    body: "Maraton bir eğitim destek aracıdır ve sınav başarısını garanti etmez. Uygulamadaki içerikler bilgilendirme amaçlıdır. Kullanım sonuçlarından doğan doğrudan veya dolaylı zararlardan sorumluluk kabul edilmez.",
  },
  {
    title: "7. Hesap Silme",
    body: "Hesabınızı istediğiniz zaman Ayarlar ekranından silebilirsiniz. Hesap silindiğinde tüm kişisel verileriniz ve çalışma kayıtlarınız kalıcı olarak kaldırılır. Bu işlem geri alınamaz.",
  },
  {
    title: "8. Değişiklikler",
    body: "Bu kullanım koşulları güncellenebilir. Önemli değişikliklerde uygulama içi bildirim yapılır. Güncellenmiş koşullar yayınlandığı andan itibaren geçerlidir. Uygulamayı kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.",
  },
  {
    title: "9. İletişim",
    body: "Kullanım koşullarıyla ilgili sorularınız için destek@maraton.app adresine e-posta gönderebilirsiniz.",
  },
];

export default function TermsScreen() {
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
        <Text style={s.headerTitle}>Kullanım Koşulları</Text>
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
