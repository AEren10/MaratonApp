import DocumentScreen from "./DocumentScreen";

/**
 * Kullanim Sartlari, tasarimin "Belge" duzeninde gosteriliyor.
 *
 * Metin daha once bu dosyanin icinde gomuluydu; ayni metin legalDocs.js'e
 * tasinip DocumentScreen'e baglaninca burada ikinci bir kopya kalmasi
 * kacinilmaz sekilde ayrisma uretirdi (ders paletinde ayni sorun vardi).
 * Ekran korunuyor cunku SCREENS.TERMS'e Kayit ve Paywall ekranlarindan da
 * gidiliyor; yalnizca icerigi tek kaynaktan okuyor.
 */
export default function TermsScreen() {
  return <DocumentScreen fallbackDocKey="terms" />;
}
