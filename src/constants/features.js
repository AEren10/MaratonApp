// Surum ozellik bayraklari. Kod SILINMEZ; v1 yuzeyini daraltmak icin.
//
// globalLeague: Genel Lig tanimadigin ilk 50 kisinin adini ve fotografini
// gosterir. Kullanici karariyla ACIK (2026-10-04). App Store 1.2 karsiligi:
// her satirda avatara dokununca Bildir / Engelle (ReportableAvatar),
// engellenen siralamadan ayiklanir, kosullarda sifir tolerans maddesi.
// Eksik kalan: ad filtresi (kufur listesi).
// homeBackdrop: ana sayfanin arka plani (deneme, 4 Ekim). "lines" isik
// huzmeleri | "dots" nokta izgarasi | null kapali. Tek satirla degisir.
export const FEATURES = Object.freeze({
  globalLeague: true,
  homeBackdrop: "lines",
});
