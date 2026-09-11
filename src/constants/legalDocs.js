// YASAL BELGELER — tek kaynak.
//
// Metinler daha once PrivacyScreen ve TermsScreen dosyalarinin icinde
// gomuluydu; tasarimin "Belge" ekrani ikisini de ayni duzende gosterdigi
// icin icerik buraya tasindi. METINLER DEGISTIRILMEDI, aynen tasindi.
//
// KVKK aydinlatma metni BURADA YOK: yasal metin uydurulamaz. Tasarimin
// "Gizlilik" ekrani bu satiri gosteriyor ama icerik saglanana kadar satir
// cizilmiyor -- bos ya da uydurma bir aydinlatma metni yayin riski olurdu.

export const LEGAL_DOCS = {
  privacy: {
    key: "privacy",
    title: "Gizlilik Politikası",
    lastUpdated: "18 Haziran 2026",
    sections: [
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
],
  },
  terms: {
    key: "terms",
    title: "Kullanım Şartları",
    lastUpdated: "20 Haziran 2026",
    sections: [
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
],
  },
};

/** Okuma suresi: ~200 kelime/dk. Tasarim "4 dk okuma" gosteriyor. */
export function readingMinutes(doc) {
  const words = (doc?.sections || []).reduce(
    (n, s) => n + (s.title + " " + s.body).trim().split(/\s+/).length,
    0,
  );
  return Math.max(1, Math.round(words / 200));
}
